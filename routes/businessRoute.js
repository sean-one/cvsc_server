
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url, deleteImageS3 } = require('../s3');
const db = require('../data/models/business');

const businessErrors = require('../error_messages/businessErrors');
const { validToken, businessAdmin } = require('../helpers/jwt_helper')

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
router.post('/create', [upload.single('business_avatar'), validToken ], async (req, res, next) => {
    try {
        let business_location
        const new_business = req.body

        // check if business location is attached
        if(new_business.business_location !== 'false') {
            business_location = {
                'venue_name': new_business.business_name,
                'street_address': new_business.street_address,
                'city': new_business.city,
                'state': new_business.state,
                'zip': new_business.zip
            }
        }
        
        // remove address elements
        delete new_business['street_address']
        delete new_business['city']
        delete new_business['state']
        delete new_business['zip']
        delete new_business['business_location']

        // remove any empty contact information
        if(!new_business.business_instagram) delete new_business['business_instagram']
        if(!new_business.business_facebook) delete new_business['business_facebook']
        if(!new_business.business_website) delete new_business['business_website']
        if(!new_business.business_phone) delete new_business['business_phone']
        if(!new_business.business_twitter) delete new_business['business_twitter']
        
        // check for file - if found upload and return image key
        if(req.file) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
            
            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)
            
            new_business['business_avatar'] = image_key
        }

        // add business creator as business admin
        new_business['business_admin'] = req.user_decoded
        new_business['active_business'] = true
        
        console.log(business_location)
        const created_business = await db.addBusiness(new_business, business_location)
        
        res.status(201).json(created_business);

    } catch (err) {
        console.log(err)
        if (err.constraint) {
            
            next({
                status: businessErrors[err.constraint]?.status,
                message: businessErrors[err.constraint]?.message,
                type: businessErrors[err.constraint]?.type
            })

        } else {
            
            next({
                status: businessErrors[err.message]?.status,
                message: businessErrors[err.message]?.message
            })

        }
    }
})

// useUpdateBusinessMutation - updateBusiness - useBusinessApi
router.put('/update/:business_id', [upload.single('business_avatar'), validToken, businessAdmin], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { business_id } = req.params;
        const business_update = req.body;
        const { business_avatar } = await db.findBusinessById(business_id)

        // if there is an image to update resize, save and delete previous
        if(req.file) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)
            
            if(!check_link.test(business_avatar)) {
                await deleteImageS3(business_avatar)
            }

            business_update['business_avatar'] = image_key
        }
    
        const updated_business = await db.updateBusiness(business_id, business_update)
        
        res.status(201).json(updated_business)
        
    } catch (error) {
        console.log(error)
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

router.delete('/remove/:business_id', async (req, res, next) => {
    try {
        const { business_id } = req.params
        const deleted_business = await db.remove(business_id)
        
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