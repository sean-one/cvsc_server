const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken')

const router = express.Router();

const { createAccessToken } = require('../helpers/jwt_helper');
const { role_types } = require('../helpers/role_types');
const rolesDB = require('../data/models/roles');
const userDB = require('../data/models/user');

router.post('/local', passport.authenticate('local', {
    failureRedirect: '/auth/login/failed',
    failWithError: true,
    session: true
}), async (req, res) => {
    const user = req.user
    const account_type = await rolesDB.findUserAccountType(user.id)
    
    console.log(user)
    if (account_type.length > 0) {
        user.account_type = account_type[0].role_type
    } else {
        user.account_type = 100
    }

    res.cookie('jwt', user.refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 })
    
    delete user['refreshToken']

    res.status(200).json({ user: user, roles: account_type })
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

            const accessToken = createAccessToken(decoded.user)
            const user_roles = await rolesDB.findUserAccountType(decoded.user)
            user_found.accessToken = accessToken
            user_found.account_type = user_roles[0].role_type || '100'
           
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

router.get('/user_profile', async (req, res) => {
    if (req.isAuthenticated()) {
        console.log('singed in')
        console.log(`user: ${req.user.id}`)
    } else {
        console.log('not signed in')
        console.log(`user: ${req.user.id}`)
    }
    try {
        const profile = req.user
        if(profile === undefined) throw new Error('no user')

        const user_roles = await rolesDB.findUserAccountType(req.user.id)
        
        if (user_roles.length > 0) {
            profile.roles = user_roles
            profile.account_type = role_types[user_roles[0].role_type]
        } else {
            profile.roles = []
            profile.account_type = 'basic'
        }
        
        res.status(200).json(profile)
    } catch(error) {
        console.log(error)
    }
})

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