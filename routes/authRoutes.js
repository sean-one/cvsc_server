const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const multer = require('multer');
const sharp = require('sharp');
const passport = require('passport');
const jwt = require('jsonwebtoken')

const router = express.Router();

const userErrors = require('../error_messages/userErrors');
const { createAccessToken, createRefreshToken, validToken, SquirrelCheck } = require('../helpers/jwt_helper');
const { uploadImageS3Url } = require('../utils/s3');
const { hashPassword } = require('../helpers/bcrypt_helper');
const { normalizeEmail } = require('../helpers/normalizeEmail');
const userDB = require('../data/models/user');
const modLogDB = require('../data/models/modlog.js');

const { loginUserValidator, registerUserValidator, result, validateImageFile } = require('../helpers/validators')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// register.jsx
router.post('/register', [upload.single('avatar'), registerUserValidator, validateImageFile, result], async (req, res, next) => {
    try {
        if (req.body.userwebsite && req.body.userwebsite !== '') {
            throw new Error('invalid_input')
        }

        // create new user
        const new_user = { username: req.body.username, email: normalizeEmail(req.body.email) }
    
        // check for attached image, upload to s3 bucket or delete the field so that db will add default
        if(req.file) {   
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
            const avatar_key = await uploadImageS3Url(req.file, 'user-profile')
            new_user['avatar'] = avatar_key
        }
    
        // hash and update password
        const hash = await hashPassword(req.body.password)
        new_user.password = hash
    
        //  create the new user in the database
        const created_user = await userDB.createUser(new_user)

        req.login(new_user, { session: false }, async (error) => {
            if(error) { return next(error); }
 
            const user = created_user[0]
            
            const accessToken = createAccessToken(user.id)
            user.accessToken = accessToken

            const refreshToken = createRefreshToken(user.id)
            await userDB.addRefreshToken(user.id, refreshToken)

            res.cookie('jwt', refreshToken)
            
            res.status(201).json(user)
        })

    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

// login.jsx
router.post('/login', loginUserValidator, result, passport.authenticate('local', {
    failureRedirect: '/auth/login/failed',
    failWithError: true,
    session: true
}), async (req, res) => {

    const user = req.user
    res.cookie('jwt', user.refreshToken)
    // res.cookie('jwt', user.refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 })
    
    delete user['refreshToken']

    res.status(200).json(user)
})

router.get('/refresh', async (req, res) => {
    const cookies = req.cookies

    if (!cookies.jwt) return res.sendStatus(401)

    const refreshToken = cookies.jwt

    const user_found = await userDB.findByRefresh(refreshToken)

    if(!user_found) return res.sendStatus(403)

    jwt.verify(
        refreshToken,
        process.env.JWT_REFRESHTOKEN_SECRET,
        async (err, decoded) => {
            if(err || user_found.id !== decoded.user) return res.sendStatus(403)
            // get user information
            const accessToken = createAccessToken(decoded.user)
            // set the accesstoken to the user details
            user_found.accessToken = accessToken
            res.json(user_found)
        }
    )
})

router.get('/modlogs', [SquirrelCheck], async (req, res, next) => {
    try {
        const modlogs = await modLogDB.getModLogs()
        return res.status(200).json(modlogs)
    } catch (error) {
        console.error('Error getting all mod logs')
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

// call google api for profile, email & google_id
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));

router.get('/google/redirect', (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
        if (err) {
            console.error('authentication error: ', err)
            return res.redirect(`/auth/login/failed?error=${encodeURIComponent(err.message)}`);
        }

        if (!user) {
            console.log('no user found or authentication failed: ', info);
            return res.redirect('/auth/login/failed');
        }

        // user found and authenticated, continue with session setup
        req.logIn(user, function(loginError) {
            if (loginError) {
                console.error('session login error: ', loginError);
                return next(loginError);
            }

            res.cookie('jwt', user.refreshToken) // { httpOnly: true, secure: true}

            delete user['refreshToken'];

            res.redirect(`${process.env.FRONTEND_CLIENT}/profile`)
        });
    })(req, res, next);
});

router.get('/generate-mfa', [validToken], async (req, res, next) => {
    try {
        const user_id = req.user_decoded;
        if (!user_id) throw new Error('invalid_user')
        
        const super_user = await userDB.findUserById(user_id)
        if (!super_user.is_superadmin) {
            return res.status(403).json({ error: { message: 'Unauthorized' } });
        }

        const tempSecret = speakeasy.generateSecret({
            name: `CoachellaValleySmokersClub(${super_user.username})`
        });

        await userDB.updateMfaSecret(super_user.id, tempSecret.base32);

        const qrCodeUrl = await QRCode.toDataURL(tempSecret.otpauth_url);

        await modLogDB.createModLog({
            action: `${super_user?.username} generated a new MFA token`,
            target_id: `${user_id}`,
            target_type: 'mfaGenerate'
        })

        res.status(200).json({ qrCodeUrl, secret: tempSecret.base32 });
        
    } catch (error) {
        console.error('Error generating MFA secret: ', error);
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

router.post('/verify-mfa', [validToken], async (req, res, next) => {
    try {
        const user_id = req.user_decoded;
        if (!user_id) throw new Error('invalid_user')
    
        const { tempToken } = req.body;
        const super_user = await userDB.checkMfaSecret(user_id)

        const verified = speakeasy.totp.verify({
            secret: super_user.mfa_secret,
            encoding: 'base32',
            token: tempToken
        })

        if (!verified) {
            return res.status(400).json({ error: { message: 'Invalid MFA Token' } });
        }

        await userDB.validateMfaSecret(super_user.id)

        await modLogDB.createModLog({
            action: `${super_user?.username} verified their MFA token and signed in`,
            target_id: `${user_id}`,
            target_type: 'mfaVerify'
        })

        res.status(201).json({ message: 'MFA successfully enabled'})
    } catch (error) {
        console.error('Error verifying MFA token: ', error);
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }
})

router.get('/login/failed', (req, res) => {
    const errorMessage = req.query.error;
    const redirectUrl = errorMessage
        ? `${process.env.FRONTEND_CLIENT}/login?error=${encodeURIComponent(errorMessage)}`
        : `${process.env.FRONTEND_CLIENT}/login`
        
    res.status(401).redirect(redirectUrl)
})

router.get('/logout', async (req, res, next) => {
    try {
        const cookies = req.cookies;
    
        // no jwt cookie was found so no need to erase
        if(!cookies?.jwt) return res.sendStatus(204)
        const refreshToken = cookies.jwt;
    
        const user_found = await userDB.findByRefresh(refreshToken)
        
        if(!user_found) {
            // refresh token not found, remove cookie and send 204
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
            return res.sendStatus(204)
        }
    
        // user found, removed from selected user and clear cookie
        await userDB.removeRefreshToken(user_found.id)

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })

        res.sendStatus(204)
    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
    }

})

module.exports = router;