
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url, deleteImageS3 } = require('../s3');
const db = require('../data/models/business');

const businessErrors = require('../error_messages/businessErrors');
const { checkBusinessManagement, validToken, businessEditRole, businessAdmin } = require('../helpers/jwt_helper');

const { newBusinessValidator, result, updateBusinessValidator, validateImageAdmin, validateImageFile } = require('../helpers/validators.js')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/business'
const router = express.Router()

// useBusinessesQuery - getBusiness - useBusinessApi
router.get('/', async (req, res) => {
    try {
        const businesses = await db.find()
        
        res.status(200).json(businesses)
        
    } catch (error) {
        console.log(error)
    }
});

// useBusinessQuery - getBusiness - useBusinessApi
router.get('/single/:business_id', async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const business = await db.findBusinessById(business_id)

        res.status(200).json(business);

    } catch (error) {
        res.status(404).json({ message: 'business not found' });

    }
});

// useCreateBusinessMutation - createBusiness - useBusinessApi
router.post('/create', [upload.single('business_avatar'), validToken, newBusinessValidator, validateImageFile, result ], async (req, res, next) => {
    let image_key
    try {
        let business_location
        const new_business = {
            business_name: req.body.business_name,
            business_description: req.body.business_description,
            business_type: req.body.business_type,
            address: req.body.address,
            business_email: req.body.business_email,
            business_phone: req.body.business_phone,
            business_instagram: req.body.business_instagram,
            business_twitter: req.body.business_twitter,
            business_facebook: req.body.business_facebook,
            business_website: req.body.business_website
        }

        // check and add user admin
        if (!req.user_decoded) {
            throw new Error('missing_admin')
        } else {
            // save requesting user as business admin
            new_business['business_admin'] = req.user_decoded
        }
        // check if business location is attached
        if (new_business.address !== undefined) {
            business_location = { 'place_id': new_business.address }
        }

        delete new_business.address
        
        // if file present resize the image and upload to s3 returning an image key or return error due to missing image
        if(req.file) {
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()
            image_key = await uploadImageS3Url(req.file)
            new_business['business_avatar'] = image_key
        } else {
            throw new Error('missing_image')
        }

        // set business as active
        new_business['active_business'] = true
        
        const created_business = await db.addBusiness(new_business, business_location)
        
        res.status(201).json(created_business);

    } catch (err) {
        console.log(err)
        // errors returned from created_business database call - invalid input errors
        if (err.constraint) {
            // error return from database after image creation, remove image from s3
            if(image_key) { await deleteImageS3(image_key) }
            
            next({
                status: businessErrors[err.constraint]?.status,
                message: businessErrors[err.constraint]?.message,
                type: businessErrors[err.constraint]?.type
            })

        } else {
            
            next({
                status: businessErrors[err.message]?.status,
                message: businessErrors[err.message]?.message,
                type: businessErrors[err.message]?.type
            })

        }
    }
})

// useUpdateBusinessMutation - updateBusiness - useBusinessApi
router.put('/update/:business_id', [upload.single('business_avatar'), validToken, checkBusinessManagement, updateBusinessValidator, validateImageAdmin, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { business_id } = req.params;
        const current_business = await db.findBusinessById(business_id)
        
        // if only the image is being updated this object will be empty
        function createUpdateObject(originalObject, keysToInclude) {
            const update_details = {};

            for (const key of keysToInclude) {
                if (key in originalObject) {
                    update_details[key] = originalObject[key];
                }
            }

            return update_details;
        }
        // include only these fields, any additional fields will be left behind
        const fieldsToInclude = [
            'business_description',
            'business_type',
            'address',
            'business_email',
            'business_phone',
            'business_instagram',
            'business_twitter',
            'business_facebook',
            'business_website'
        ];

        const business_update = createUpdateObject(req.body, fieldsToInclude);

        // if attempting to change from business type other then brand, an address must be attached or already on the business
        if(business_update?.business_type !== 'brand' && (!current_business?.location_id && !business_update?.address)) {
            throw new Error('business_address_required')
        }
        
        // if there is an image to update resize, save and delete previous
        if(req.file && req.business_role === process.env.ADMIN_ACCOUNT) {
            // get current image for delete
            const { business_avatar } = await db.findBusinessById(business_id)
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()
            
            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)
            
            if(!check_link.test(business_avatar)) {
                await deleteImageS3(business_avatar)
            }
            
            business_update['business_avatar'] = image_key
        }

        const updated_business = await db.updateBusiness(business_id, business_update, req.user_decoded)
        
        res.status(201).json(updated_business)
        
    } catch (error) {
        console.log(error)
        if (error.message) {

            next({
                status: businessErrors[error.message]?.status,
                message: businessErrors[error.message]?.message,
                type: businessErrors[error.message]?.type
            })

        }
        // if (err.constraint === 'contacts_email_unique') {
        //     res.status(400).json({ message: 'duplicate email', type: 'email'})
        // } else {
        //     res.status(500).json({ message: "server not connected", err });
        // }
        
    }
})

// useActiveBusinessToggle - toggleActiveBusiness - useBusinessApi
router.put('/toggle-active/:business_id', [validToken, businessAdmin], async (req, res) => {
    try {
        const { business_id } = req.params;
        const business = await db.toggleActiveBusiness(business_id)

        res.status(201).json(business)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'something went wrong yo!' })
    }
})

// useBusinessRequestToggle - toggleBusinessRequest - useBusinessApi
router.put('/toggle-request/:business_id', [validToken, businessAdmin], async (req, res) => {
    try {
        const { business_id } = req.params;
        const business = await db.toggleBusinessRequest(business_id)
        
        res.status(201).json(business)
            
        } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'something went a stray' })
        
    }
})

// useRemoveBusinessMutation - removeBusiness - useBusinessApi
router.delete('/remove/:business_id', async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const deleted_business = await db.removeBusiness(business_id)
        
        if (deleted_business >= 1) {
            
            res.status(204).json(deleted_business);

        } else {

            const error = new Error('invalid id')
            error.message = 'not found';
            error.status = 404;
            throw error;

        }

    } catch (error) {
        
        console.log(error)
        if (error.errors) {
            
            res.status(400).json({ message: 'bad request', path: error.path, error: `${error.params.path} failed validation` });

        } else {
            
            next(error)
        }
    }
})

module.exports = router;