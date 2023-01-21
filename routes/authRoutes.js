const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken')

const router = express.Router();

const { createAccessToken } = require('../helpers/jwt_helper');
const rolesDB = require('../data/models/roles');
const userDB = require('../data/models/user');

router.post('/local', passport.authenticate('local', {
    failureRedirect: '/auth/login/failed',
    failWithError: true,
    session: true
}), async (req, res) => {
    const user = req.user
    const user_roles = await rolesDB.findUserRoles(user.id)
    const filter_inactive = user_roles.filter(role => role.active_role)
    user.account_type = filter_inactive[0]?.role_type || process.env.BASIC_ACCOUNT
    
    res.cookie('jwt', user.refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 })
    
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