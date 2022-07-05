const express = require('express');
const passport = require('passport');

// const db = require('../data/models/user')
// const { hashPassword, comparePassword } = require('../helpers/bcrypt_helper');

const router = express.Router();

router.post('/local', passport.authenticate('local', { failureRedirect: '/auth/login/failed' }), (req, res) => {
    res.status(200).json({ success: true, message: 'successful', user: req.user })
})

// call google api for profile, email & google_id
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }));

router.get('/google/redirect', passport.authenticate("google", {
    successRedirect: 'http://localhost:3000/profile',
    failureRedirect: '/auth/login/failed',
    session: true
}))

router.get('/login/success', (req, res) => {
    if(req.user) {
        res.status(200).json({ success: true, message: 'successful', user: req.user })
    } else {
        res.status(401).json({ success: false, message: 'user not found' })
    }
})

router.get('/login/failed', (req, res) => {
    res.status(401).json({ message: 'failure'}).redirect('http://localhost:3000/login')
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
    })
    res.status(200).json({ success: true, message: 'successful logout' })
    // res.redirect('http://localhost:3000')
})

module.exports = router;