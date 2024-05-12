const express = require('express');
const multer = require('multer');
const sharp = require('sharp')
const jwt = require('jsonwebtoken');

const db = require('../data/models/user');
const userErrors = require('../error_messages/userErrors');
const { hashPassword } = require('../helpers/bcrypt_helper');
const { validToken, createEmailValidationToken } = require('../helpers/jwt_helper')
const { uploadImageS3Url, deleteImageS3 } = require('../utils/s3');
const { sendEmail } = require('../utils/ses.mailer');

const { result, updateUserValidator, validateImageFile, checkEmailVerificationStatus } = require('../helpers/validators')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

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
            user_changes.email = req.body.email;
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
            <a href="${verificationUrl}">${verificationUrl}</a>
        `;

        await sendEmail('coachellavalleysmokersclub@gmail.com', 'Verify Your Email', emailHtml);

        await db.markValidationPending(user_id, email_token)
        
        res.status(200).json({ message: 'Verification email sent. Click the link in your email' });
    } catch (error) {
        console.error('Failed to send verification email:', error);
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
});

// Endpoint to verify the email
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token } = req.query;
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.findUserById(payload.userId);
        if (!user) {
            throw new Error('invalid_user');
        }

        if (user.email !== payload.email) {
            throw new Error('non_matching_validation')
        }

        await db.validateEmailVerify(payload.userId, user.email);

        res.status(200).json({ message: 'email has been successfully verified' });
    } catch (error) {
        console.error('Error verifying email:', error);
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({ message: 'Verification link expired or invalid' });
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