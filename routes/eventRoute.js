const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('../data/models/event');
const { validateToken, validateUserCreate } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
});

router.post('/', [ validateToken, validateUserCreate ], async (req, res, next) => {
    // confirm newEvent.created_by is eqaul to subject (user) inside token
    // also confirm user has admin role to at least one of either location_id or brand_id
    try {
        const newEvent = req.body
        newEvent.created_by = req.decodedToken.subject
        // console.log(newEvent);
        const event = await db.createEvent(newEvent)
        res.status(200).json(event);
    } catch (err) {
        next(err)
        // res.status(400).json({ message: 'there was an error'})
    }
    //     .catch(err => res.status(500).json(err));
});

router.get('/location/:id', (req, res) => {
    const { id } = req.params;
    db.findByLocation(id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => {
            res.status(500).json(err)
        });
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