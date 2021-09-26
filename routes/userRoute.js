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
    // during validation adjust '' to null or default before sending to server
    if(!newUser.username || !newUser.password || !newUser.email) {
        res.status(400).json({ message: 'please fill all required inputs' });
    }
    try {
        const hash = await hashPassword(newUser.password);
        newUser.password = hash;
        const user = await db.addUser(newUser);
        const token = createToken(user[0]);
        user[0].token = token;
        // remove hashed password from the return object
        delete user[0]['password']
        res.status(200).json(user[0]);    
    } catch (error) {
        if(error.constraint === 'users_username_unique') {
            res.status(400).json({ message: 'username is not available', type: 'username' })
            // console.log('username error')
        }

        if(error.constraint === 'users_email_unique') {
            res.status(400).json({ message: 'email duplicate', type: 'email' })
            // console.log('email error')
        }

        res.status(500).json({ message: 'something went wrong', error })
    }
})

router.post('/login', async (req, res) => {
    const userInfo = req.body
    if(!userInfo.username || !userInfo.password) {
        res.status(400).json({ message: 'please fill all required inputs' });
    } else {
        const user = await db.findByUsername(userInfo)
        console.log(user)
        if (!user) {
            res.status(404).send({ message: 'user not found' })
        } else {
            const passwordVerify = await comparePassword(userInfo.password, user.password)
            if (!passwordVerify) {
                res.status(401).send({ message: 'invalid credentials'})
            } else {
                const token = createToken(user);
                user.token = token;
                // remove the hashed password & roles from the return object
                // delete user['roles']
                delete user['password']
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