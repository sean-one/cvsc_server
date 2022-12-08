const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { deleteImageS3, uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validToken, validateCreator, eventCreator } = require('../helpers/jwt_helper');

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

//! updated endpoint
router.post('/', [upload.single('eventmedia'), validToken, validateCreator], async (req, res, next) => {
    try {
        const new_event = req.body

        if(!req.user_decoded) throw new Error('invalid_admin')
        new_event.created_by = req.user_decoded
        
        if(!req.file) throw new Error('missing_image')
        const { event_id } = await db.createEvent(new_event)

        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file)

        if(!image_key) throw new Error('upload_error')

        const event = await db.updateImage(event_id, image_key)

        res.status(201).json(event)

    } catch (error) {
        console.log(error.message)
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

router.get('/:event_id', (req, res) => {
    const { event_id } = req.params
    db.findById(event_id)
        .then(event => {
            res.status(200).json(event);
        })
        .catch(err => {
            res.status(500).json(err);
        });
})

router.post('/update/:event_id', [ upload.single('eventmedia'), validToken, eventCreator ], async (req, res, next) => {
    try {
        const { event_id } = req.params
        const event_updates = req.body;
        const { eventmedia } = await db.findById(event_id)
        
        if(req.file) {
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

            // upload to s3 and get key
            const image_key = await uploadImageS3Url(req.file)

            await deleteImageS3(eventmedia)
            
            event_updates['eventmedia'] = image_key
        }

        const event_updated = await db.updateEvent(event_id, event_updates)
        
        res.status(201).json(event_updated)
    } catch (error) {
        console.log('this is the error in event route')
        console.log(error.message)
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
})

router.post('/update_image/:event_id', [upload.single('eventmedia'), validToken, eventCreator], async (req, res, next) => {
    try {
        console.log(req.file)
        // get the event id
        if(!req.file) throw new Error('missing_image')
        const { event_id } = req.params
        
        // get the event 'eventmedia' from the database
        // save current eventmedia link
        const { eventmedia } = await db.findById(event_id)

        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

        // update database with new event media link
        const new_image_key = await uploadImageS3Url(req.file)

        if(!new_image_key) throw new Error('upload_error')

        const updated_event = await db.updateImage(event_id, new_image_key)

        // if on s3 remove from bucket
        await deleteImageS3(eventmedia)

        // return event with updated event media included
        res.status(202).json(updated_event)
        
    } catch (error) {
        console.log('error inside the update_image route')
        console.log(error)
    }
})


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