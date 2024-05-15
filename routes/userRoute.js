const express = require('express');
const multer = require('multer');
const sharp = require('sharp')
const jwt = require('jsonwebtoken');

const db = require('../data/models/user');
const userErrors = require('../error_messages/userErrors');
const { hashPassword } = require('../helpers/bcrypt_helper');
const { normalizeEmail } = require('../helpers/normalizeEmail');
const { validToken, createEmailValidationToken, createResetPasswordToken, SquirrelCheck } = require('../helpers/jwt_helper')
const { uploadImageS3Url, deleteImageS3 } = require('../utils/s3');
const { sendEmail } = require('../utils/ses.mailer');

const { result, updateUserValidator, validateImageFile, checkEmailVerificationStatus, checkPasswordResetStatus, uuidValidation } = require('../helpers/validators')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

router.get('/', [SquirrelCheck], async (req, res, next) => {
    try {
        const users = await db.getAllUsers()
        
        res.status(200).json(users)
    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

// user.account - delete_account
router.delete('/delete', [ validToken ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        if(!user_id) throw new Error('invalid_user')

        const deletedUser = await db.removeUser(user_id)
        
        if (deletedUser >= 1) {
            res.status(204).json({ success: 'ok' });

        } else {
            throw  new Error('delete_failed');
        }

    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })

    }
})

// user.account - update_user
router.post('/update', [ upload.single('avatar'), validToken, updateUserValidator, validateImageFile, result ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const user_changes = {}
        const user = await db.findUserById(user_id)

        if (user === undefined) {
            throw new Error('invalid_user')
        }

        if(req.body?.username) {
            user_changes.username = req.body.username
        }

        if(req.body?.email) {
            user_changes.email = normalizeEmail(req.body.email);
            user_changes.email_verified = false;
            user_changes.email_verified_pending = null
        }

        if(req.body?.password) {
            // hash and save password
            const hash = await hashPassword(req.body.password)
            user_changes.password = hash
        }

        // check for user avatar image update if none delete avatar field
        if(req.file) {
            // optimize image for upload
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()
            const image_key = await uploadImageS3Url(req.file, 'user-profile')

            if(!image_key) throw new Error('upload_error')

            // check if previous link was s3 bucket, if so remove previous image from bucket
            if(!!user.avatar) {
                await deleteImageS3(user.avatar)
            }

            // update avatar image key for upload
            user_changes.avatar = image_key
        }

        // make sure there are changes to be made
        if (Object.keys(user_changes).length !== 0) {
            const user_details = await db.updateUser(user_id, user_changes)
    
            res.status(201).json(user_details)
        } else {
            throw new Error('empty_object')
        }
        
    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
        
    }

})

// user.account - verifyEmailButton
router.post('/send-verification-email', [validToken, checkEmailVerificationStatus], async (req, res, next) => {
    try {
        const user_id = req.user_decoded;
        if (!user_id) throw new Error('invalid_user');

        const user = await db.findUserById(user_id)
        if (!user || user.email === null) {
            throw new Error('invalid_user')
        }

        const email_token = createEmailValidationToken(user_id, user.email)
        const verificationUrl = `${process.env.FRONTEND_CLIENT}/email-verified?token=${email_token}`;

        const emailHtml = `
            <h4>Email Verification</h4>
            <p>Please click on the link below to verify your email address:</p>
            <a href="${verificationUrl}">Email Validation link</a>
        `;

        await sendEmail('coachellavalleysmokersclub@gmail.com', 'Verify Your Email', emailHtml);

        await db.markValidationPending(user_id, email_token)
        
        res.status(200).json({ message: 'verification email sent' });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
});

// forgotPassword.js
router.post('/forgot-password', [ checkPasswordResetStatus ], async (req, res, next) => {
    try {
        const { useremail } = req.body
        if (!useremail) { throw new Error('incomplete_input') };
        let normalizedEmail = normalizeEmail(useremail)
        
        const forgetful_user = await db.findByEmail(normalizedEmail)
        if (!forgetful_user) {
            throw new Error('invalid_user')
        }

        if (forgetful_user.email_verified === false) {
            throw new Error('email_not_validated')
        }

        const resetToken = createResetPasswordToken(normalizedEmail)
        const resetUrl = `${process.env.FRONTEND_CLIENT}/reset-password?token=${resetToken}`

        const emailHtml = `
            <h4>Reset Password</h4>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset password link</a>
        `

        await sendEmail('coachellavalleysmokersclub@gmail.com', 'Reset your password.', emailHtml);

        await db.markResetPasswordPending(normalizedEmail, resetToken)

        res.status(200).json({ message: 'password reset email sent, close this window and check email'});
        
    } catch (error) {
        console.error('Failed to send reset email:', error);
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }

})

// resetPassword.js
router.post('/reset-password', async (req, res, next) => {
    const { token } = req.query;
    const { password } = req.body;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.findByResetToken(token)
        if (!user) { throw new Error('invalid_user') }
        if (user.email !== payload.email) { throw new Error('non_matching_email') }

        // hash and save password
        const hashed_password = await hashPassword(password)

        const { username } = await db.validatePasswordReset(user.email, hashed_password)

        res.status(201).json({ username: username, message: `password for ${username} has been updated`})
    } catch (error) {
        console.error('Error resetting password:', error)
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            next({
                status: 400,
                message: 'password reset link expired or invalid',
                type: 'server'
            })
        } else {
            next({
                status: userErrors[error.message]?.status,
                message: userErrors[error.message]?.message,
                type: userErrors[error.message]?.type
            })
        }
    }
})

router.delete('/squirrel-user-ban/:user_id', [SquirrelCheck, uuidValidation, result], async (req, res, next) => {
    try {
        const { user_id } = req.params;
        if (!user_id) { throw new Error('invalid_user') }

        const userbanned = await db.removeUser(user_id)

        if (userbanned >= 1) {
            res.status(204).json({ success: 'ok' });
        } else {
            throw new Error('delete_failed');
        }
    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

// emailVerificationPage - to verify the users email
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token } = req.query;
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.findUserById(payload.userId);
        if (!user) {
            throw new Error('invalid_user');
        }

        if (user.email !== payload.email) {
            throw new Error('non_matching_email')
        }

        await db.validateEmailVerify(payload.userId, user.email);

        res.status(200).json({ message: 'email has been successfully verified' });
    } catch (error) {
        console.error('Error verifying email:', error);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            next({
                status: 400,
                message: 'verification link expired or invalid',
                type: 'server'
            })
        } else {
            next({
                status: userErrors[error.message]?.status,
                message: userErrors[error.message]?.message,
                type: userErrors[error.message]?.type,
            })
        }
    }
});

module.exports = router;