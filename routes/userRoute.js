const express = require('express');

const db = require('../data/models/user')
const userErrors = require('../error_messages/userErrors');
const { hashPassword, comparePassword } = require('../helpers/bcrypt_helper');
const { createToken, validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

// at registration page
router.post('/register', async (req, res, next) => {
    try {
        const new_user = { username: req.body.username, password: req.body.password, email: req.body.email }    
        if (!new_user.username || !new_user.password || !new_user.email) throw new Error('incomplete_input')
        
        // hash password, save hashed password to new_user
        const hash = await hashPassword(new_user.password);
        new_user.password = hash;
        
        // insert the new_user into the users table
        const user = await db.register_user(new_user);
        
        // create token then save to user
        const token = createToken(user);
        user.token = token;
        
        res.status(200).json(user);

    } catch (error) {
        // console.log(error)
        if (error.constraint) {
            next({
                status: userErrors[error.constraint]?.status,
                message: userErrors[error.constraint]?.message,
                type: userErrors[error.constraint]?.type
            })

        } else {
            next({
                status: userErrors[error.message]?.status,
                message: userErrors[error.message]?.message,
                type: userErrors[error.message]?.type
            })

        }
    }
})

// at login page
router.post('/login', async (req, res, next) => {
    try {
        // get what is needed from the request body
        const { username, password } = req.body
        if (!username || !password) throw new Error('incomplete_input')

        // get the user to compare password
        const user = await db.user_login(username);
        if (!user) throw new Error('user_not_found')

        // verify password
        const passwordVerify = await comparePassword(password, user.password);
        if (!passwordVerify) throw new Error('invalid_credentials')
        
        // create token then save to user
        const token = createToken(user);
        user.token = token;

        delete user['password']

        res.status(200).json(user);
    } catch (error) {
        // console.log(error)
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type
        })
    }

})



// not use in the app yet
router.get('/', (req, res) => {
    db.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/updateAvatar', [ validateToken ], async (req, res) => {
    try {
        const avatarLink = req.body
        const { user_id } = req.decodedToken
        await db.updateAvatar(user_id, avatarLink)
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