const express = require('express');
// const jwt = require('jsonwebtoken');

const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validateToken, validateUser, validateUserRole, validateCreatorRights, validateEventEditRights } = require('../helpers/jwt_helper');

// '/events'
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

router.put('/:id', [ validateEventEditRights ], (req, res, next) => {
    try {
        const { id } = req.params
        const changes = req.body;
        db.updateEvent(id, changes)
            .then(event => {
                res.status(201).json(event)
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({ message: "server not connected", err });
            });
    } catch (error) {
        console.log(error.message)
        next(error)
    }
})

router.post('/', [ validateCreatorRights ], async (req, res, next) => {
    try {
        const new_event = {
            eventname: req.body.eventname,
            eventdate: req.body.eventdate,
            eventstart: req.body.eventstart,
            eventend: req.body.eventend,
            venue_id: req.body.venue_id,
            brand_id: req.body.brand_id,
            details: req.body.details,
            eventmedia: req.body.eventmedia,
            created_by: req.user.id

        }
        
        const event = await db.createEvent(new_event)
        
        res.status(201).json(event);

    } catch (error) {
        console.log(error)
        if (error.constraint === 'events_eventname_unique') {
            next({ status: eventErrors[error.constraint]?.status, message: eventErrors[error.constraint]?.message })

        } else {
            next({ status: eventErrors[error.message]?.status, message: eventErrors[error.message]?.message })

        }
    }
});

router.get('/user/:id', [ validateToken, validateUser ], (req, res) => {
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
            user: req.decodedToken.user_id,
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