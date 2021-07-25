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

router.get('/:id', (req, res) => {
    const { id } = req.params
    db.findById(id)
        .then(event => {
            res.status(200).json(event);
        })
        .catch(err => {
            res.status(500).json(err);
        });
})

router.post('/', [ validateToken, validateUserCreate ], async (req, res, next) => {
    try {
        const newEvent = req.body
        newEvent.created_by = req.decodedToken.subject
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
    console.log(req)
    try {
        const deleteDetails = {
            user: req.decodedToken.subject,
            event: parseInt(req.params.eventid)
        }
        // console.log(deleteDetails)
        const deletedEvent = await db.removeEvent(deleteDetails)
        if (deletedEvent >= 1) {
            res.status(204).json();
        } else {
            console.log(deletedEvent)
            res.status(400).json({ message: 'invalid credentials' })
        }
    } catch (err) {
        console.log('not found')
        res.status(401).json({ message: 'invalid token', error: err})
    }
})

module.exports = router;