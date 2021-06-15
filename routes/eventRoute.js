const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('../data/models/event');
const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/', async (req, res) => {
    // confirm newEvent.created_by is eqaul to subject (user) inside token
    // also confirm user has admin role to at least one of either location_id or brand_id
    const newEvent = req.body
    await db.createEvent(newEvent)
        .then(event => {
            console.log('event', event)
            res.status(200).json(event);
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

router.delete('/remove/:eventid', validateToken, async (req, res) => {
    try {
        const deleteDetails = {
            user: req.decodedToken.subject,
            event: parseInt(req.params.eventid)
        }
        const deletedEvent = await db.removeEvent(deleteDetails)
        if (deletedEvent >= 1) {
            res.status(204).json();
        } else {
            res.status(400).json({ message: 'invalid credentials' })
        }
    } catch (err) {
        console.log('not found')
        res.status(401).json({ message: 'invalid token', error: err})
    }
})

module.exports = router;