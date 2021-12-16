const express = require('express');
const googleMapsClient = require('../helpers/geocoder');

const db = require('../data/models/business');
const locationDb = require('../data/models/location');

const router = express.Router()

router.get('/', (req, res) => {
    db.find()
        .then(businesses => {
            res.status(200).json(businesses);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/add', async (req, res) => {
    const businessDetails = req.body
    try {
        db.addBusiness(businessDetails)
            .then(business => {
                res.status(200).json(business);
            })
            .catch(err => {
                console.log(err)
                res.status(500).json(err)
            });
    } catch (error) {
        console.log(error)
        throw error
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



module.exports = router;