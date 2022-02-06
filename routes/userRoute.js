const express = require('express');

const db = require('../data/models/user')
const { hashPassword, comparePassword } = require('../helpers/bcrypt_helper');
const { createToken, validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/register', async (req, res) => {
    const newUser = req.body.user
    const userContact = req.body.contact
    
    try {
        // hash password, save hashed password to new_user
        const hash = await hashPassword(newUser.password);
        newUser.password = hash;
        // insert the new_user into the users table
        const user = await db.registerNewUser(newUser, userContact);
        // add roles if any
        user.business_roles = [];
        // create token then save to user
        const token = createToken(user);
        user.token = token;
        // create contact object and remove from user
        user.contact = { email: user['email'], instagram: user['instagram'] }
        delete user['email']
        delete user['instagram']

        res.status(200).json(user);    
    } catch (error) {
        if(error.constraint === 'users_username_unique') {
            res.status(400).json({ message: 'username is not available', type: 'username' })
        }

        // else if(error.constraint === 'users_email_unique') {
        //     res.status(400).json({ message: 'email duplicate', type: 'email' })
        // }
        
        else if(error.constraint === 'contacts_email_unique') {
            res.status(400).json({ message: 'email duplicate', type: 'email' })
        }

        else {
            console.log(error)
            res.status(500).json({ message: 'something went wrong', error })
        }
    }
})

router.post('/login', async (req, res) => {
    const userInfo = req.body
    if(!userInfo.username || !userInfo.password) {
        res.status(400).json({ message: 'please fill all required inputs' });
    } else {
        const user = await db.userSignIn(userInfo)
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
                user.contact = { email: user['email'], instagram: user['instagram'] }
                // add facebook example
                // user.contact = { email: user['email'], instagram: user['instagram'], facebook: user['facebook] }
                delete user['password']
                delete user['email']
                delete user['instagram']
                // add facebook example
                // delete user['facebook']
                res.status(200).json(user);
            }
        }
    }
})

router.post('/updateAvatar', [ validateToken ], async (req, res) => {
    try {
        const avatarLink = req.body
        const userId = req.decodedToken.subject
        console.log(avatarLink)
        console.log(userId)
        await db.updateAvatar(userId, avatarLink)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log(error)
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