const express = require('express');
const multer = require('multer');
const sharp = require('sharp')

const db = require('../data/models/user');
const userErrors = require('../error_messages/userErrors');
const { hashPassword } = require('../helpers/bcrypt_helper');
const { validToken } = require('../helpers/jwt_helper')
const { uploadImageS3Url, deleteImageS3 } = require('../s3');

const { result, updateUserValidator, validateImageFile, uuidValidation } = require('../helpers/validators')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

// user.account - delete_account
router.delete('/delete', [ validToken ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        if(!user_id) throw new Error('invalid_user')

        const deletedUser = await db.removeUser(user_id)
        
        console.log(`INSIDE THE ROUTE: deletedUser: ${deletedUser}`)
        if (deletedUser >= 1) {
            console.log('made it into send the successful status 204')
            res.status(204).json({ success: 'ok' });

        } else {
            throw  new Error('delete_failed');
        }

    } catch (error) {
        console.log(error)
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })

    }
})

// user.account - update_user
router.post('/update', [ upload.single('avatar'), validToken, updateUserValidator, validateImageFile, result ], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const user_id = req.user_decoded
        const user_changes = {}
        const user = await db.findUserById(user_id)

        if (user === undefined) {
            throw new Error('invalid_user')
        }

        if(req.body?.username) {
            user_changes.username = req.body.username
        }

        if(req.body?.email) {
            user_changes.email = req.body.email
        }

        if(req.body?.password) {
            // hash and save password
            const hash = await hashPassword(req.body.password)
            user_changes.password = hash
        }

        // check for user avatar image update if none delete avatar field
        if(req.file) {
            // optimize image for upload
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()
            const image_key = await uploadImageS3Url(req.file)

            if(!image_key) throw new Error('upload_error')

            // check if previous link was s3 bucket, if so remove previous image from bucket
            if(!check_link.test(user.avatar) && user.avatar !== null) {
                await deleteImageS3(user.avatar)
            }

            // update avatar image key for upload
            user_changes.avatar = image_key
        }

        // make sure there are changes to be made
        if (Object.keys(user_changes).length !== 0) {
            const user_details = await db.updateUser(user_id, user_changes)
    
            res.status(201).json(user_details)
        } else {
            throw new Error('empty_object')
        }
        
    } catch (error) {
        next({
            status: userErrors[error.message]?.status,
            message: userErrors[error.message]?.message,
            type: userErrors[error.message]?.type,
        })
        
    }

})

module.exports = router;