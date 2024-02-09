const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { deleteImageS3, uploadImageS3Url } = require('../s3')
const db = require('../data/models/event');
const eventErrors = require('../error_messages/eventErrors');
const { validToken } = require('../helpers/jwt_helper');
const {
    newEventValidator,
    updateEventValidator,
    validateEventCreator,
    validateImageFile,
    uuidValidation,
    result,
    validateEventBusinessRemove,
    formatValidationCheck,
    validateEventBusinessRoles
} = require('../helpers/validators');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/events'
const router = express.Router();

// useRemoveEventBusinessMutation - removes a business id from venue_id and or brand_id & sets active_event to false
router.put('/:event_id/remove/:business_id', [validToken, uuidValidation, formatValidationCheck, validateEventBusinessRemove, result], async (req, res, next) => {
    try {
        const { event_id, business_id } = req.params
        const deleted_business = await db.removeEventBusiness(event_id, business_id)

        console.log('sending the deleted business return')
        console.log(deleted_business)
        res.status(201).json(deleted_business)

    } catch (error) {
        console.log(`route catch error: ${error}`)
        // 'token' - 401, 403 / 'server' - 403 / *path - 400
        next({
            status: eventErrors[error.message]?.status,
            type: eventErrors[error.message]?.type,
            message: eventErrors[error.message]?.message,
        })
    }
});

// useBusinessEventsQuery - returns all the events for a business id
router.get('/business/:business_id', [uuidValidation, result], async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const business_events = await db.getBusinessEvents(business_id)

        res.status(200).json(business_events)
    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

// useEventRelatedEventsQuery - returns all the events for an event id (all events that include event venue and event brand)
router.get('/event-related/:event_id', [uuidValidation, result], async (req, res, next) => {
    try {
        const { event_id } = req.params;

        const event_related_events = await db.getEventRelatedEvents(event_id)

        res.status(200).json(event_related_events)
    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type
        })
    }
})

// useUserEventsQuery - returns all the events for a user id
router.get('/user/:user_id', [validToken, uuidValidation, result], async (req, res, next) => {
    try {
        const { user_id } = req.params;
        
        if (req.user_decoded !== user_id) { throw new Error('invalid_user') }
        
        const user_events = await db.getUserEvents(user_id)
        
        res.status(200).json(user_events);
    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

// useEventQuery - returns a single event from event id
// event.edit.view - inside useEffect
router.get('/:event_id', [uuidValidation, result], async (req, res, next) => {
    try {
        const { event_id } = req.params
        const selected_event = await db.getEventById(event_id)

        if (selected_event === undefined) {
            throw new Error('event_not_found')
        } else {
            res.status(200).json(selected_event)
        }
    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

// useUpdateEventMutation - update event
router.put('/:event_id', [upload.single('eventmedia'), validToken, uuidValidation, formatValidationCheck, validateEventBusinessRoles, updateEventValidator, validateImageFile, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params
        // const event_updates = req.body;

        // check for any additional fields and rmove them
        function createUpdateObject(originalObject, keysToInclude) {
            const update_details = {}

            for (const key of keysToInclude) {
                if (key in originalObject) {
                    update_details[key] = originalObject[key];
                }
            }

            return update_details
        }

        // only fields to include in update object
        const fieldsToInclude = ['eventname', 'eventdate', 'eventstart', 'eventend', 'venue_id', 'details', 'brand_id']

        const event_update = createUpdateObject(req.body, fieldsToInclude)

        if (req.file) {
            const { eventmedia } = await db.getEventById(event_id)
            // resize the image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).toBuffer()

            // upload to s3 and get key
            const image_key = await uploadImageS3Url(req.file)

            if (!image_key) throw new Error('upload_error')

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

// useRemoveEventMutation - removes an event from the database
router.delete('/:event_id', [validToken, uuidValidation, formatValidationCheck, validateEventCreator, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params
        const { eventmedia, eventname, venue_id, brand_id } = await db.getEventById(event_id)

        const deleteResponse = await db.removeEvent(event_id)

        if (deleteResponse >= 1) {
            // check for image hosted on s3 and delete if found
            if (!check_link.test(eventmedia)) await deleteImageS3(eventmedia)

            res.status(200).json({ user_id: req.user_decoded, eventname: eventname, venue_id: venue_id, brand_id: brand_id, event_id: event_id });
        } else {
            throw new Error('event_not_found')
        }
    } catch (error) {
        next({
            status: eventErrors[error.message].status,
            message: eventErrors[error.message].message,
            type: eventErrors[error.message].type
        })
    }
});

// useEventsQuery - returns all active events - main calendar call
router.get('/', async (req, res, next) => {
    try {
        const events = await db.getAllEvents()
        
        res.status(200).json(events);
    } catch (error) {
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});

// useCreateEventMutation - create a new event
router.post('/', [upload.single('eventmedia'), validToken, validateEventBusinessRoles, newEventValidator, validateImageFile, result], async (req, res, next) => {
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
        next({
            status: eventErrors[error.message]?.status,
            message: eventErrors[error.message]?.message,
            type: eventErrors[error.message]?.type,
        })
    }
});


module.exports = router;