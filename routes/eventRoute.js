const express = require('express');

const db = require('../data/models/event');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
});

router.get('/location/:id', (req, res) => {
    const { id } = req.params;
    db.findByLocation(id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
})

router.get('/brand/:id', (req, res) => {
    const { id } = req.params;
    db.findByBrand(id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
})

router.get('/user/:id', (req, res) => {
    const { id } = req.params;
    db.findByCreator(id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
})

module.exports = router;