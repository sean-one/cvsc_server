const express = require('express');

const db = require('../data/models/user')
const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router();


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