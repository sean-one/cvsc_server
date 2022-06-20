const express = require('express');

const db = require('../data/models/business');
const businessErrors = require('../error_messages/businessErrors');
const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router()

// '/business'
router.get('/', (req, res) => {
    db.find()
        .then(businesses => {
            res.status(200).json(businesses);
        })
        .catch(err => res.status(500).json(err));
});

// inside the createBusiness on submit
// creates a new business with activeBusiness & arppoval set to false also creates a top user admin role
router.post('/create', [ validateToken ], async (req, res, next) => {
    try {
        const new_business = req.body

        new_business['business_admin'] = req.decodedToken.user_id

        // check to be sure if not brand must include address fields
        if(new_business.business_type === 'brand' && typeof new_business.location === 'object') throw new Error('brand_address_not_valid')
        if(new_business.business_type !== 'brand' && new_business.location === null) throw new Error('business_address_required')

        const created_business = await db.addBusiness(new_business)
        
        res.status(201).json(created_business);

    } catch (err) {
        console.log(err)
        if (err.constraint) {
            next({ status: businessErrors[err.constraint]?.status, message: businessErrors[err.constraint]?.message })
        } else {
            next({ status: businessErrors[err.message]?.status, message: businessErrors[err.message]?.message })
        }
        // else if (err instanceof TypeError) {
        //     res.status(400).json({ message: 'invalid address', type: 'street_address' })

        // } 
    }
})

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const business_update = req.body;
    db.updateBusiness(id, business_update)
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