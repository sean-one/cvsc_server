
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url, deleteImageS3 } = require('../s3');
const db = require('../data/models/business');

const businessErrors = require('../error_messages/businessErrors');
const { validToken, businessEditRole, businessAdmin } = require('../helpers/jwt_helper')

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
    let image_key
    try {
        let business_location
        const new_business = req.body

        console.log(new_business)

        // check user admin
        if (!req.user_decoded) {
            throw new Error('missing_admin')
        } else {
            // save requesting user as business admin
            new_business['business_admin'] = req.user_decoded
        }

        // be sure all required inputs are submitted
        if (!new_business.business_name || !new_business.business_type || !new_business.business_description || !new_business.business_email) {
            throw new Error('missing_incomplete')
        }
        
        // confirm address is include for business venue
        if (new_business.business_type === 'both' || new_business.business_type === 'venue') {
            if (!new_business.address) {
                throw new Error('missing_location')
            }
        }

        // check that business name is not already in database
        const business_unique = await db.checkBusinessName(new_business.business_name)
        if(business_unique !== undefined) {
            throw new Error('businesses_business_name_unique')
        }

        // check if business location is attached
        if (new_business.address !== undefined ) {
            business_location = {
                'business_address': new_business.address
            }
        }
        
        // if file present resize the image and upload to s3 returning an image key or return error due to missing image
        if(req.file) {
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
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
        console.log('============= businessRoute catch ==============')
        console.log(err)
        console.log('================================================')
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
router.put('/update/:business_id', [upload.single('business_avatar'), validToken, businessEditRole], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { business_id } = req.params;
        const business_update = req.body;
        const { business_avatar } = await db.findBusinessById(business_id)

        // if there is an image to update resize, save and delete previous
        if(req.file && req.business_role === process.env.ADMIN_ACCOUNT) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)
            
            if(!check_link.test(business_avatar)) {
                await deleteImageS3(business_avatar)
            }

            business_update['business_avatar'] = image_key
        }

        if(req.business_role === process.env.MANAGER_ACCOUNT && business_update['business_type']) {
            delete business_update['business_type']
        }
    
        const updated_business = await db.updateBusiness(business_id, business_update, req.business_role)
        
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