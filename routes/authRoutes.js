const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const passport = require('passport');
const jwt = require('jsonwebtoken')

const router = express.Router();

const authErrors = require('../error_messages/authErrors');
const { createAccessToken, createRefreshToken } = require('../helpers/jwt_helper');
const { uploadImageS3Url } = require('../s3');
const { hashPassword } = require('../helpers/bcrypt_helper');
const rolesDB = require('../data/models/roles');
const userDB = require('../data/models/user');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/register', upload.single('avatar'), async (req, res, next) => {
    try {
        
        // make sure all required fields are present
        if(!req.body.username || !req.body.password || !req.body.email) { throw new Error('incomplete_input') }
        
        // check username format - only allow alphanumeric and *, _, -, ., $, !, @ (non repeating)
        const alphanumeric = /^[a-zA-Z0-9*@_.\-!$]+$/;
        const repeatingspecial = /^(?!.*([*@_.\-!$])\1)[a-zA-Z0-9*@_.\-!$]+$/;
        if(!alphanumeric.test(req.body.username) || !repeatingspecial.test(req.body.username)) { throw new Error('invalid_username') }
    
        // confirm usename does not already exist in db
        const user_list = await userDB.findByUsername(req.body.username)
        if(user_list !== undefined) { throw new Error('duplicate_username') }
        
        // create new user
        const new_user = { username: req.body.username, email: req.body.email }
    
        // check for attached image, upload to s3 bucket or delete the field so that db will add default
        if(req.file) {   
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
            const avatar_key = await uploadImageS3Url(req.file)
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

            user.account_type = process.env.BASIC_ACCOUNT

            res.cookie('jwt', refreshToken)

            res.status(201).json({ user: user, roles: [] })
        })

    } catch (error) {
        // console.log(error)
        next({
            status: authErrors[error.message]?.status,
            message: authErrors[error.message]?.message,
            type: authErrors[error.message]?.type,
        })
    }
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login/failed',
    failWithError: true,
    session: true
}), async (req, res) => {
    const user = req.user
    const user_roles = await rolesDB.findUserRoles(user.id)
    const filter_inactive = user_roles.filter(role => role.active_role)
    user.account_type = filter_inactive[0]?.role_type || process.env.BASIC_ACCOUNT
    
    res.cookie('jwt', user.refreshToken)
    // res.cookie('jwt', user.refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 })
    
    delete user['refreshToken']

    res.status(200).json({ user: user, roles: user_roles })
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
            // find ALL roles attached to user active & inactive
            const user_roles = await rolesDB.findUserRoles(decoded.user)
            // set the accesstoken to the user details
            user_found.accessToken = accessToken
            // filter out all inactive role request
            const filter_inactive = user_roles.filter(role => role.active_role)
            // get highest role type in all active only roles
            user_found.account_type = filter_inactive[0]?.role_type || process.env.BASIC_ACCOUNT
           
            res.json({ user: user_found, roles: user_roles })
        }
    )
})

// call google api for profile, email & google_id
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));

router.get('/google/redirect', passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_CLIENT}/profile`,
    failureRedirect: '/auth/login/failed',
    session: true
}))

router.get('/login/failed', (req, res) => {
    res.status(401).redirect(`${process.env.FRONTEND_CLIENT}/login`)
})

router.get('/logout', async (req, res, next) => {
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

})

module.exports = router;