const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { deleteImageS3, uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validToken } = require('../helpers/jwt_helper');
const { newEventValidator, updateEventValidator, validateEventCreation, validateEventUpdate, validateImageFile, result } = require('../helpers/validators');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/events'
const router = express.Router();

//! updated endpoint - needs error handling
router.get('/', async (req, res) => {
    try {
        const events = await db.find()
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json(error)
    }
});

//! useEventsApi - createEvent - useCreateEventMutation - CREATE NEW EVENT
router.post('/', [upload.single('eventmedia'), validToken, validateEventCreation, newEventValidator, validateImageFile, result], async (req, res, next) => {
    console.log(req.body)
    try {
        const new_event = req.body

        new_event.created_by = req.user_decoded
        
        if(!req.file) throw new Error('missing_image')
        
        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file)
        
        if(!image_key) throw new Error('upload_error')
        new_event['eventmedia'] = image_key
        
        const event = await db.createEvent(new_event)

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

//! useEventsApi - updateEvent - useUpdateEventMutation - UPDATE EVENT
router.post('/update/:event_id', [upload.single('eventmedia'), validToken, validateEventUpdate, updateEventValidator, validateImageFile, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params
        // const event_updates = req.body;
        
        // check for any additional fields and rmove them
        function createUpdateObject(originalObject, keysToInclude) {
            const update_details = {}

            for (const key of keysToInclude) {
                if(key in originalObject) {
                    update_details[key] = originalObject[key];
                }
            }

            return update_details
        }

        // only fields to include in update object
        const fieldsToInclude = [
            'eventname',
            'eventdate',
            'eventstart',
            'eventend',
            'venue_id',
            'details',
            'brand_id'
        ]

        const event_update = createUpdateObject(req.body, fieldsToInclude)

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

            event_update['eventmedia'] = image_key
        }

        const event_updated = await db.updateEvent(event_id, event_update)
        
        res.status(201).json(event_updated)

    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

// useEventsApi - removeBusiness - useRemoveEventBusinessMutation
router.put('/remove_business/:event_id', [validToken], async (req, res, next) => {
    try {
        const { event_id } = req.params
        const { event_updates } = req.body

        await db.removeEventBusiness(event_id, event_updates.business_type)
        
        res.status(202).json({ success: true })

    } catch (error) {
        console.log('INSIDE THE ROUTE CATCH')
        console.log(error)
        next({
            status: eventErrors[error.message]?.status,
            type: eventErrors[error.message]?.type,
            message: eventErrors[error.message]?.message,
        })
    }
})

// useEventsApi - removeEvent - useRemoveEventMutation
router.delete('/remove/:event_id', [validToken], async (req, res) => {
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
router.get('/user/:user_id', [validToken], async (req, res) => {
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