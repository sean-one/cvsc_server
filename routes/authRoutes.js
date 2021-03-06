const express = require('express');
const passport = require('passport');

const rolesDB = require('../data/models/roles')

const router = express.Router();


router.post('/local', passport.authenticate('local', { failureRedirect: '/auth/login/failed' }), (req, res) => {
    res.status(200).json({ success: true, message: 'successful', user: req.user })
})

// call google api for profile, email & google_id
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));

router.get('/google/redirect', passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_CLIENT}/profile`,
    failureRedirect: '/auth/login/failed',
    session: true
}))

router.get('/login/success', async (req, res) => {
    console.log(`req.user: ${req.user}`)
    if(req.user) {
        // grab all active and inactive roles for user
        const user_roles = await rolesDB.findByUser_All(req.user.id)
        // add user and roles to return
        res.status(200).json({ success: true, message: 'successful', user: req.user, roles: user_roles || [] })
    } else {
        res.status(401).json({ success: false, message: 'user not found' })
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