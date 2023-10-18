
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url, deleteImageS3 } = require('../s3');
const db = require('../data/models/business');
const { updatedGoogleMapsClient } = require('../helpers/geocoder');

const businessErrors = require('../error_messages/businessErrors');
const { validToken } = require('../helpers/jwt_helper');

const {
    newBusinessValidator,
    updateBusinessValidator,
    validateImageAdmin,
    validateImageFile,
    validateBusinessManagement,
    validateBusinessAdmin,
    uuidValidation,
    result,
} = require('../helpers/validators.js');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/business'
const router = express.Router()

// return a list of all businesses
router.get('/', async (req, res) => {
    try {
        const businesses = await db.find()
        
        res.status(200).json(businesses)
        
    } catch (error) {
        console.log(error)
    }
});

// useBusinessQuery - getBusiness - useBusinessApi - VIEW BUSINESS PAGE
router.get('/:business_id', [ uuidValidation, result ], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const business = await db.findBusinessById(business_id)
        
        if(business === undefined) {
            throw new Error('business_not_found')
        }

        res.status(200).json(business);

    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type
        })

    }
});

// useCreateBusinessMutation - createBusiness - useBusinessApi - CREATE BUSINESS
router.post('/', [upload.single('business_avatar'), validToken, newBusinessValidator, validateImageFile, result ], async (req, res, next) => {
    let image_key
    try {
        const new_business = {
            business_name: req.body.business_name,
            business_description: req.body.business_description,
            business_type: req.body.business_type,
            business_email: req.body.business_email,
            business_admin: req.user_decoded,
            active_business: true,

            place_id: req.body?.place_id,
            business_phone: req.body?.business_phone,
            business_instagram: req.body?.business_instagram,
            business_twitter: req.body?.business_twitter,
            business_facebook: req.body?.business_facebook,
            business_website: req.body?.business_website,
        }

        // remove any undefined values from new business object
        Object.keys(new_business).forEach(key => {
            if (typeof new_business[key] === 'undefined') {
                delete new_business[key];
            }
        });

        // check if business location is attached
        if (new_business.place_id) {
            const geocode = await updatedGoogleMapsClient.geocode({ params: { place_id: new_business.place_id, key: process.env.GEOCODER_API_KEY }, timeout: 1000 })
            
            new_business.formatted_address = geocode.data.results[0].formatted_address
        } else {
            delete new_business.place_id
        }

        // if file present resize the image and upload to s3 returning an image key or return error due to missing image
        if(req.file) {
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()
            image_key = await uploadImageS3Url(req.file)
            new_business['business_avatar'] = image_key
        } else {
            throw new Error('missing_image')
        }
        
        const created_business = await db.addBusiness(new_business)
        
        res.status(201).json(created_business);

    } catch (err) {
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

// useBusinessToggle - business.admin.view toggle active & toggle request
router.put('/:business_id/toggle', [validToken, validateBusinessAdmin, result], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const { toggleType } = req.body;
    
        if (toggleType === 'active') {
            const updatedBusiness = await db.toggleActiveBusiness(business_id)
            res.status(201).json(updatedBusiness)
        }

        else if (toggleType === 'request') {
            const updatedBusiness = await db.toggleBusinessRequest(business_id)
            res.status(201).json(updatedBusiness)
        }

        else {
            throw new Error('invalid_toggle_type')
        }
        
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type,
        })
    }
})

// useUpdateBusinessMutation - updateBusiness - useBusinessApi - UPDATE BUSINESS
router.put('/:business_id', [upload.single('business_avatar'), validToken, validateBusinessManagement, updateBusinessValidator, validateImageAdmin, result], async (req, res, next) => {
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
            'formatted_address',
            'place_id',
            'business_email',
            'business_phone',
            'business_instagram',
            'business_twitter',
            'business_facebook',
            'business_website'
        ];

        const business_update = createUpdateObject(req.body, fieldsToInclude);

        // if attempting to change from business type other then brand, an address must be attached or already on the business
        if(business_update?.business_type !== 'brand' && (!current_business?.place_id && !business_update?.place_id)) {
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
        if(error.constraint) {
            next({
                status: businessErrors[error.constraint]?.status,
                message: businessErrors[error.constraint]?.message,
                type: businessErrors[error.constraint]?.type,
            })
        } else if (error.message) {

            next({
                status: businessErrors[error.message]?.status,
                message: businessErrors[error.message]?.message,
                type: businessErrors[error.message]?.type
            })

        }
    }
})

//! useRemoveBusinessMutation - removeBusiness - useBusinessApi - DELETE BUSINESS
router.delete('/:business_id', [validToken, validateBusinessAdmin, result], async (req, res, next) => {
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