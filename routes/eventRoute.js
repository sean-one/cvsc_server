const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('../data/models/event');
const { validateToken, validateUser } = require('../helpers/jwt_helper');

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

router.put('/:id', [ validateToken, validateUser ], (req, res) => {
    const { id } = req.params
    const changes = req.body;
    db.updateEvent(id, changes)
        .then(count => {
            if (count) {
                res.status(200).json({ message: `${count} event updated` });
            } else {
                res.status(404).json({ message: "event not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "server not connected", err });
        });
})

router.post('/', [ validateToken, validateUser ], async (req, res, next) => {
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