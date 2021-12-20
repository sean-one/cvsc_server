const express = require('express');

const db = require('../data/models/business');
const { validateToken, validateUserAdmin } = require('../helpers/jwt_helper');

const router = express.Router()

router.get('/', (req, res) => {
    db.find()
        .then(businesses => {
            res.status(200).json(businesses);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/add', [ validateToken ], async (req, res) => {
    
    const businessDetails = req.body
    businessDetails.business['business_admin'] = req.decodedToken.subject
    
    try {
        
        const newBusiness = await db.addBusiness(businessDetails)
        
        res.status(201).json(newBusiness);

    } catch (err) {
        console.log(err)
        if (err.constraint === 'contacts_email_unique') {
            res.status(400).json({ message: 'duplicate email', type: 'email' })

        } else if (err.constraint === 'locations_place_id_unique') {
            res.status(400).json({ message: 'duplicate address', type: 'street_address' })

        } else if (err.constraint === 'businesses_name_unique') {
            res.status(400).json({ message: 'duplicate business name', type: 'business_name' })

        } else if (err instanceof TypeError) {
            res.status(400).json({ message: 'invalid address', type: 'street_address' })
            
        } else {
            res.status(500).json({ message: 'something went wrong', err })
        }
    }
})

router.get('/brands', (req, res) => {
    db.findBrands()
        .then(brands => {
            res.status(200).json(brands);
        })
        .catch(err => res.status(500).json(err));
});

router.get('/venues', (req, res) => {
    db.findVenues()
        .then(venues => {
            res.status(200).json(venues);
        })
        .catch(err => res.status(500).json(err));
});

router.get('/pending-approval', (req, res) => {
    db.findPending()
        .then(businesses => {
            res.status(200).json(businesses);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/update-approval', async (req, res, next) => {
    try {
        const businessIds = req.body
        const approved = await db.approveBusiness(businessIds)
        if (approved >= 1) {
            res.status(204).json()
        } else {
            const error = new Error('invalid id');
            error.message = 'invalid id, not found';
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
    // console.log(req.body)
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

router.delete('/remove/:id', [ validateUserAdmin ], async (req, res, next) => {
    try {
        const { id } = req.params
        const deletedUser = await db.remove(id)

        if (deletedUser >= 1) {
            res.status(204).json();
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