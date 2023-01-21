const express = require('express');
const multer = require('multer');
const sharp = require('sharp')

const db = require('../data/models/user')
const userErrors = require('../error_messages/userErrors');
const { validToken } = require('../helpers/jwt_helper')
const { uploadImageS3Url } = require('../s3');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();


router.get('/get_profile', (req, res) => {
    console.log(Object.keys(req))
    console.log(req.session)
    console.log(`user inside /users/get_profile: ${req.user}`)
    if (req.user === undefined) { return res.status(400).json() }
    return res.status(200).json(req.user);
})

router.post('/update_user', [ upload.single('avatar'), validToken ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const user_changes = req.body

        if(!user_id) throw new Error('invalid_user')

        if(req.file) {
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
            const image_key = await uploadImageS3Url(req.file)

            if(!image_key) throw new Error('upload_error')
            user_changes['avatar'] = image_key
        }

        const user_details = await db.updateUser(user_id, user_changes)

        console.log(user_details)
        
        res.status(201).json(user_details)
        
    } catch (error) {
        console.log(error.message)
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
        
    }

})

//!
router.delete('/remove/:user_id', async (req, res, next) => {
    try {
        const user_id = req.params
        const deletedUser = await db.removeUser(id)
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