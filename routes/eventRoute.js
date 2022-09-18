const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
// const jwt = require('jsonwebtoken');

const { uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validateToken, validateUser, validateUserRole, validateCreatorRights, validateEventEditRights } = require('../helpers/jwt_helper');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

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
        console.log('finished validation')
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
        console.log('this is the error in event route')
        console.log(error.message)
        next(error)
    }
})

router.post('/', upload.single('eventmedia'), async (req, res, next) => {
    const new_event = req.body
    console.log('new event BEFORE ifs')
    console.log(new_event)
    if(!new_event.eventstart) {
        delete new_event['eventstart']
    } else {
        new_event.eventstart = parseInt(new_event.eventstart.replace(':', ''))
    }

    if(!new_event.eventend) {
        delete new_event['eventend']
    } else {
        new_event.eventend = parseInt(new_event.eventend.replace(':',''))
    }

    if(!new_event.eventmedia) delete new_event['eventmedia']
    if(!new_event.venue_id) delete new_event['venue_id']
    if(!new_event.details) delete new_event['details']
    if(!new_event.brand_id) delete new_event['brand_id']

    console.log('new event AFTER ifs')
    console.log(new_event)
    if(req.file) {
        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file)
    
        // add uploaded image link to body & add created by user
        new_event.eventmedia = `${process.env.AWS_IMAGELINK}${image_key}`
    }
    
    // add user as created by admin for event
    new_event.created_by = req.user.id

    if(Object.keys(new_event).length === 9) {
        new_event.active_event = true
    } else {
        new_event.active_event = false
    }

    const event = await db.createEvent(new_event)
    
    res.status(201).json(event)
});

router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;
    db.findByCreator(user_id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
})

router.get('/inactive/user', (req, res) => {
    db.findInactive(req.user.id)
        .then(events => {
            res.status(200).json(events);
        })
        .catch(err => res.status(500).json(err));
})

router.delete('/remove/:eventid', async (req, res) => {
    try {
        const deletedEvent = await db.removeEvent(req.user.id, req.params.eventid)

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