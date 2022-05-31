const express = require('express');

const db = require('../data/models/location');
const locationErrors = require('../error_messages/locationErrors');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(locations => {
            res.status(200).json(locations);
        })
        .catch(err => res.status(500).json(err));
})

router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.findById(id)
        .then(location => {
            if(location) {
                res.status(200).json(location);
            } else {
                res.status(404).json({ message: 'location not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'failure', error: err });
        });
});

router.put('/:id', (req, res, next) => {
    const { id } = req.params;
    const location_update = req.body;

    db.updateLocation(id, location_update)
        .then(location => {
            if(location) {
                res.status(201).json(location);
            } else {
                res.status(404).json({ message: 'there was an error'})
            }
        })
        .catch(err => {
            if(err.name === 'TypeError') {
                next({
                    status: locationErrors[err.name]?.status,
                    message: locationErrors[err.name]?.message,
                    type: locationErrors[err.name]?.type
                })
            } else {
                res.status(500).json({ message: 'failuer', error: err });
            }
        })
});

module.exports = router;