const express = require('express');
const multer = require('multer');
const sharp = require('sharp')

const db = require('../data/models/user');
const dbBusiness = require('../data/models/business');
const userErrors = require('../error_messages/userErrors');
const { hashPassword } = require('../helpers/bcrypt_helper');
const { validToken } = require('../helpers/jwt_helper')
const { uploadImageS3Url, deleteImageS3 } = require('../s3');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();


// user.account - update_user
router.post('/update_user', [ upload.single('avatar'), validToken ], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const user_id = req.user_decoded
        const user_changes = req.body
        const { user } = await db.findUserById(user_id)
        
        console.log('req.file')
        console.log(req.file)
        
        if(!user_id) throw new Error('invalid_user')

        if(user_changes?.password) {
            const hash = await hashPassword(user_changes.password)
            user_changes['password'] = hash
        }

        if(req.file) {
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
            const image_key = await uploadImageS3Url(req.file)

            if(!image_key) throw new Error('upload_error')

            console.log(user.avatar)
            if(!check_link.test(user.avatar) && user.avatar !== null) {
                await deleteImageS3(user.avatar)
            }

            user_changes['avatar'] = image_key
        } else {
            delete user_changes['avatar']
        }

        if(Object.keys(user_changes).length === 0) throw new Error('empty_object')

        const user_details = await db.updateUser(user_id, user_changes)

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

// user.account - delete_account
router.delete('/remove_user', [ validToken ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded

        const deletedUser = await db.removeUser(user_id)
        
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