const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
// const jwt = require('jsonwebtoken');

const { uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validToken, validateCreator, validateUser, validateUserRole, validateEventEditRights } = require('../helpers/jwt_helper');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/events'
const router = express.Router();

//! updated endpoint - needs error handling
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

router.put('/:id', (req, res, next) => {
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
        console.log('this is the error in event route')
        console.log(error.message)
        next(error)
    }
})

//! updated endpoint - needs error handling
router.post('/', upload.single('eventmedia'), [validToken, validateCreator], async (req, res, next) => {
    
    const new_event = req.body
    
    // format eventstart
    if(!new_event.eventstart) {
        delete new_event['eventstart']
    } else {
        new_event.eventstart = parseInt(new_event.eventstart.replace(':', ''))
    }

    // format eventend
    if(!new_event.eventend) {
        delete new_event['eventend']
    } else {
        new_event.eventend = parseInt(new_event.eventend.replace(':',''))
    }

    // remove empty entries
    if(!new_event.eventmedia) delete new_event['eventmedia']
    if(!new_event.venue_id) delete new_event['venue_id']
    if(!new_event.details) delete new_event['details']
    if(!new_event.brand_id) delete new_event['brand_id']

    // check for file upload
    if(req.file) {
        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file)
    
        // add uploaded image link to body & add created by user
        new_event.eventmedia = `${process.env.AWS_IMAGELINK}${image_key}`
    }
    
    // add user as created by admin for event
    new_event.created_by = req.user_decoded

    // if all options are complete event marked as active, else inactive
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

router.get('/business/:business_id', (req, res) => {
    const { business_id } = req.params;
    db.findByBusiness(business_id)
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

router.put('/business/remove/:event_id', (req, res) => {
    const { event_id } = req.params
    db.removeBusiness(event_id, req.body.business_type)
        .then(event => {
            res.status(201).json(event)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        });
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