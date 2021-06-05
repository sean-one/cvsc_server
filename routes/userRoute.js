const express = require('express');

const db = require('../data/models/user')
const { hashPassword, comparePassword } = require('../helpers/bcrypt_helper');
const { createToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/register', async (req, res) => {
    const newUser = req.body
    if(!newUser.username || !newUser.password || !newUser.email) {
        res.status(400).json({ message: 'please fill all required inputs' });
    } else {
        const hash = await hashPassword(newUser.password);
        newUser.password = hash;
        const user = await db.addUser(newUser);
        res.status(200).json(user);
    }
})

router.post('/login', async (req, res) => {
    const userInfo = req.body
    if(!userInfo.username || !userInfo.password) {
        res.status(400).json({ message: 'please fill all required inputs' });
    } else {
        const user = await db.findByUsername(userInfo)
        if (!user) {
            res.status(404).json({ message: 'user not found' })
        } else {
            const passwordVerify = await comparePassword(userInfo.password, user.password)
            if (!passwordVerify) {
                res.status(401).json({ message: 'invalid credentials'})
            } else {
                const token = createToken(user);
                user.token = token;
                res.status(200).json(user);
            }
        }
    }
})

router.delete('/remove/:id', async (req, res, next) => {
    try {
        const id = req.params
        const deletedUser = await db.remove(id)
        if (deletedUser >= 1) {
            res.status(204).json();
        } else {
            const error = new Error('invalid id');
            error.message = 'not found';
            error.status = 404;
            throw error;
        }
    } catch (error) {
        if (error.errors) {
            res.status(400).json({ message: 'bad request', path: error.path, error: `${error.params.path} failed validation` });
        } else {
            next(error)
        }

    }
})

module.exports = router;