const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { deleteImageS3, uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validToken, validateEventCreation, eventCreator, eventManager } = require('../helpers/jwt_helper');

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

// useEventsApi - createEvent - useCreateEventMutation
router.post('/', [upload.single('eventmedia'), validToken, validateEventCreation], async (req, res, next) => {
    try {
        const new_event = req.body

        if(!req.user_decoded) throw new Error('invalid_admin')
        new_event.created_by = req.user_decoded
        
        if(!req.file) throw new Error('missing_image')
        
        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file)
        
        if(!image_key) throw new Error('upload_error')
        new_event['eventmedia'] = image_key
        
        const event = await db.createEvent(new_event)
        // const event = await db.updateImage(event_id, image_key)

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

router.get('/:event_id', async (req, res, next) => {
    try {
        const { event_id } = req.params
        const selected_event = await db.findById(event_id)

        res.status(200).json(selected_event)
    } catch (error) {
        console.log(error)
    }
});

// useEventsApi - updateEvent - useUpdateEventMutation
router.post('/update/:event_id', [upload.single('eventmedia'), validToken, eventCreator], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params
        const event_updates = req.body;
        
        if(req.file) {
            const { eventmedia } = await db.findById(event_id)
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

            // upload to s3 and get key
            const image_key = await uploadImageS3Url(req.file)

            if (!check_link.test(eventmedia)) {
                // if on s3 remove from bucket
                await deleteImageS3(eventmedia)
            }

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
});

// useEventsApi - removeBusiness - useRemoveEventBusinessMutation
router.put('/remove_business/:event_id', [ validToken, eventManager ], async (req, res, next) => {
    try {
        const { event_id } = req.params
        const { event_updates } = req.body

        await db.removeEventBusiness(event_id, event_updates.business_type)
        
        res.status(202).json({ success: true })

    } catch (error) {
        console.log(error)
        next({
            status: eventErrors[error.message]?.status,
            type: eventErrors[error.message]?.type,
            message: eventErrors[error.message]?.message,
        })
    }
})

// useEventsApi - removeEvent - useRemoveEventMutation
router.delete('/remove/:event_id', [validToken, eventCreator], async (req, res) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params
        const { eventmedia, eventname } = await db.findById(event_id)

        const deletedEvent = await db.removeEvent(event_id)

        if (deletedEvent >= 1) {
            // check for image hosted on s3 and delete if found
            if(!check_link.test(eventmedia)) await deleteImageS3(eventmedia)

            res.status(204).json(eventname);
        } else {
            console.log(deletedEvent)
            res.status(400).json({ message: 'invalid credentials' })
        }
    } catch (err) {
        console.log('not found')
        res.status(401).json({ message: 'invalid token', error: err })
    }
})

//! useEventsApi - getAllUserEvents - useUserEventsQuery
router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;
    db.findUserEvents(user_id)
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


module.exports = router;