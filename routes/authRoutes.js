const express = require('express');
const passport = require('passport');

const router = express.Router();

const { role_types } = require('../helpers/role_types')
const rolesDB = require('../data/models/roles')

router.post('/local', passport.authenticate('local', {
    failureRedirect: '/auth/login/failed',
    failWithError: true,
    session: true
}), (req, res) => {
    res.status(200).json(req.user)
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

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
    })
    res.status(200).json({ success: true, message: 'successful logout' })
})

module.exports = router;