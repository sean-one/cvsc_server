const express = require('express');

const db = require('../data/models/location');

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

module.exports = router;