
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url, deleteImageS3 } = require('../s3');
const db = require('../data/models/business');
const { updatedGoogleMapsClient } = require('../helpers/geocoder');

const businessErrors = require('../error_messages/businessErrors');
const { validToken } = require('../helpers/jwt_helper');

const {
    formatValidationCheck,
    newBusinessValidator,
    updateBusinessValidator,
    validateImageFile,
    validateBusinessManagement,
    validateBusinessAdmin,
    uuidValidation,
    result,
} = require('../helpers/validators.js');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/businesses'
const router = express.Router()

// useBusinessesQuery - return a list of all businesses
router.get('/', async (req, res, next) => {
    try {
        let businesses = await db.getAllBusinesses()
       
        res.status(200).json(businesses)
        
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type,
        })
    }
});

// useCreateBusinessMutation - createBusiness - useBusinessApi - CREATE BUSINESS
router.post('/', [upload.single('business_avatar'), validToken, newBusinessValidator, validateImageFile, result], async (req, res, next) => {
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
        if (req.file) {
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
            if (image_key) { await deleteImageS3(image_key) }

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
});

// useBusinessManagement - get an array of businesses based on user id with management rights
router.get('/managed', [validToken], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const business_management_list = await db.getBusinessManagement(user_id)

        res.status(200).json(business_management_list)
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type,
        })
    }
});

// useBusinessQuery - getBusiness - useBusinessApi - VIEW BUSINESS PAGE
router.get('/:business_id', [uuidValidation, result], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const business = await db.getBusinessById(business_id)

        if (business === undefined) {
            throw new Error('business_not_found')
        } else {
            res.status(200).json(business);
        }
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type
        })

    }
});

// useBusinessToggle - business.admin.view toggle active & toggle request
router.put('/:business_id/status/toggle', [validToken, uuidValidation, formatValidationCheck, validateBusinessAdmin, result], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const { toggleType } = req.body;

        if (toggleType === 'active') {
            const updatedBusiness = await db.toggleActiveBusiness(business_id)
            res.status(201).json({ ...updatedBusiness, toggleType: toggleType })
        }

        else if (toggleType === 'request') {
            const updatedBusiness = await db.toggleBusinessRequest(business_id)
            res.status(201).json({ ...updatedBusiness, toggleType: toggleType })
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
});

// router.put('/:business_id/address/remove')

// useBusinessTransferMutation - business.admin.view tranfer business account and admin role to manager
router.put('/:business_id/transfer/:manager_id', [validToken, uuidValidation, formatValidationCheck, validateBusinessAdmin, result], async (req, res, next) => {
    try {
        const { business_id, manager_id } = req.params;
        const user_id = req.user_decoded;

        const transferResponse = await db.transferBusiness(business_id, manager_id, user_id)
        console.log(transferResponse)
        res.status(201).json(transferResponse)
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type,
        })
    }
})


// useUpdateBusinessMutation - updateBusiness - useBusinessApi - UPDATE BUSINESS
router.put('/:business_id', [upload.single('business_avatar'), validToken, uuidValidation, formatValidationCheck, validateBusinessManagement, updateBusinessValidator, validateImageFile, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { business_id } = req.params;
        const current_business = await db.getBusinessById(business_id)

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

        // removes any unknown fields
        const business_update = createUpdateObject(req.body, fieldsToInclude);
        
        // if place_id is present validate it with google
        if (business_update?.place_id) {
            try {
                const geocode = await updatedGoogleMapsClient.geocode({
                    params: { place_id: business_update.place_id, key: process.env.GEOCODER_API_KEY },
                    timeout: 1000
                })

                business_update.formatted_address = geocode.data.results[0].formatted_address
            } catch (error) {
                if (error?.response?.status === 400) {
                    throw new Error('invalid_place_id')
                }

                if (error?.response?.status === 403) {
                    throw new Error('geocode_error')
                }
            }
        }

        // if attempting to change from business type other then brand, an address must be attached or already on the business
        if (business_update?.business_type) { // Check if business_type is being updated
            if (((business_update?.business_type === 'venue') || (business_update?.business_type === 'both')) && (!current_business?.place_id && !business_update?.place_id)) {
                throw new Error('business_address_required');
            }
        }

        // if there is an image to update resize, save and delete previous
        if (req.file) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'cover' }).toBuffer()

            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)

            // check the current_business.business_avatar to see if it is saved on the s3 bucket
            // if it is delete it from the s3 bucket
            if (!check_link.test(current_business?.business_avatar)) {
                await deleteImageS3(current_business?.business_avatar)
            }

            // update business_update with image_key from s3 image upload
            business_update['business_avatar'] = image_key
        }

        // if there are no changes in the update there is no need to hit the database
        if (Object.keys(business_update).length === 0) {
            throw new Error('no_changes')
        }

        const updated_business = await db.updateBusiness(business_id, business_update)

        res.status(201).json(updated_business)

    } catch (error) {
        if (error.constraint) {
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
});

// useRemoveBusinessMutation - removeBusiness - useBusinessApi - DELETE BUSINESS
router.delete('/:business_id', [validToken, validateBusinessAdmin, result], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const deleted_business = await db.removeBusiness(business_id)

        if (deleted_business.success) {
            res.status(200).json(deleted_business);
        } else {
            throw new Error('delete_failed');
        }
    } catch (error) {
        next({
            status: businessErrors[error.message]?.status,
            message: businessErrors[error.message]?.message,
            type: businessErrors[error.message]?.type,
        })
    }
});


module.exports = router;