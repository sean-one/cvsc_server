const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { uploadImageS3Url } = require('../s3');
const db = require('../data/models/business');
const businessErrors = require('../error_messages/businessErrors');
// const { validateToken } = require('../helpers/jwt_helper');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/business'
const router = express.Router()

router.get('/', (req, res) => {
    db.find()
        .then(businesses => {
            res.status(200).json(businesses);
        })
        .catch(err => res.status(500).json(err));
});

// inside the createBusiness on submit
// creates a new business with activeBusiness & arppoval set to false also creates a top user admin role
router.post('/create', upload.single('business_avatar'), async (req, res, next) => {
    try {
        let business_location
        const new_business = req.body

        // check for business type, if 'brand' remove address elements, else create location oject and delete address elements
        if(new_business.business_type === 'brand') {
            
            delete new_business['street_address']
            delete new_business['city']
            delete new_business['state']
            delete new_business['zip']

        } else {
            business_location = {
                'venue_name': new_business.business_name,
                'street_address': new_business.street_address,
                'city': new_business.city,
                'state': new_business.state,
                'zip': new_business.zip
            }

            delete new_business['street_address']
            delete new_business['city']
            delete new_business['state']
            delete new_business['zip']
        }

        if(!new_business.business_instagram) delete new_business['business_instagram']
        if(!new_business.business_facebook) delete new_business['business_facebook']
        if(!new_business.business_website) delete new_business['business_website']
        if(!new_business.business_phone) delete new_business['business_phone']
        if(!new_business.business_twitter) delete new_business['business_twitter']

        // check to be sure if not brand must include address fields
        if(new_business.business_type === 'brand' && typeof new_business.location === 'object') throw new Error('brand_address_not_valid')
        if(new_business.business_type !== 'brand' && new_business.location === null) throw new Error('business_address_required')
        
        if(req.file) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain'}).toBuffer()
            
            // upload the image to s3
            const image_key = await uploadImageS3Url(req.file)
            
            new_business['business_avatar'] = `${process.env.AWS_IMAGELINK}${image_key}`
        }

        // add business creator as business admin
        new_business['business_admin'] = req.user.id
        
        console.log('just before sending to database')
        console.log(new_business)
        const created_business = await db.addBusiness(new_business, business_location)
        
        res.status(201).json(created_business);

    } catch (err) {
        console.log(err)
        if (err.constraint) {
            next({ status: businessErrors[err.constraint]?.status, message: businessErrors[err.constraint]?.message, type: businessErrors[err.constraint]?.type })
        } else {
            next({ status: businessErrors[err.message]?.status, message: businessErrors[err.message]?.message })
        }
        // else if (err instanceof TypeError) {
        //     res.status(400).json({ message: 'invalid address', type: 'street_address' })

        // } 
    }
})

router.put('/:business_id', (req, res) => {
    const { business_id } = req.params;
    const business_update = req.body;
    db.updateBusiness(business_id, business_update)
        .then(business => {
            res.status(201).json(business)
        })
        .catch(err => {
            console.log(err.constraint)
            if (err.constraint === 'contacts_email_unique') {
                res.status(400).json({ message: 'duplicate email', type: 'email'})
            } else {
                res.status(500).json({ message: "server not connected", err });
            }
        })
})

router.put('/toggle-active/:business_id', (req, res) => {
    const { business_id } = req.params;
    db.toggleActiveBusiness(business_id, req.user.id)
        .then(business => {
            res.status(200).json(business)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: 'something wrong yo'})
        })
})

router.put('/toggle-request/:business_id', (req, res) => {
    const { business_id } = req.params;
    db.toggleBusinessRequest(business_id, req.user.id)
        .then(business => {
            res.status(200).json(business)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: 'something went a stray' })
        })
})

// used in postman to get pending request
router.get('/pending/business-request', (req, res) => {
    db.findPending()
        .then(businesses => {
            res.status(200).json(businesses)
        })
        .catch(err => res.status(500).json(err))
})

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.findById(id)
    .then(business => {
        if(business) {
            res.status(200).json(business);
        } else {
            res.status(404).json({ message: 'business not found'});
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ message: 'failure', error: err });
    });
});

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