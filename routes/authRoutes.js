const express = require('express');
const passport = require('passport');

// const db = require('../data/models/user')
// const { hashPassword, comparePassword } = require('../helpers/bcrypt_helper');

const router = express.Router();

router.get('/google', passport.authenticate("google", { scope: "profile", }));

router.get('/google/redirect', (req, res) => {
    console.log(req)
})

router.get('/google/callback', passport.authenticate("google", { session: true }), (req, res) => {
    res.send(req.user)
})

module.exports = router;