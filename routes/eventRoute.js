const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { deleteImageS3, uploadImageS3Url } = require('../utils/s3')
const db = require('../data/models/event');
const { updatedGoogleMapsClient } = require('../helpers/geocoder');

const eventErrors = require('../error_messages/eventErrors');
const { validToken } = require('../helpers/jwt_helper');
const {
    newEventValidator,
    updateEventValidator,
    validateEventCreator,
    validateImageFile,
    uuidValidation,
    result,
    formatValidationCheck,
    validateEventBusinessRoles,
    validateEventUpdate
} = require('../helpers/validators');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// '/events'
const router = express.Router();

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
router.put('/:event_id', [upload.single('eventmedia'), validToken, uuidValidation, formatValidationCheck, validateEventUpdate, updateEventValidator, validateImageFile, result], async (req, res, next) => {
    try {
        const check_link = /^(http|https)/g
        const { event_id } = req.params

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
        const fieldsToInclude = [
            'eventname',
            'place_id',
            'eventdate',
            'eventstart',
            'eventend',
            'host_business',
            'details',
        ]

        const event_update = createUpdateObject(req.body, fieldsToInclude)

        // check for place id and set formatted address
        if (event_update?.place_id) {
            try {
                const geocodeResponse = await updatedGoogleMapsClient.geocode({
                    params: { place_id: event_update.place_id, key: process.env.GEOCODER_API_KEY },
                    timeout: 1000
                });

                if (geocodeResponse?.data?.status === 'OK' && geocodeResponse?.data?.results.length > 0) {
                    let formatted_address = geocodeResponse?.data?.results[0]?.formatted_address.replace(', USA', '');
                    event_update.formatted_address = formatted_address;
                } else {
                    throw new Error('geocode_failed')
                }
            } catch (error) {
                // log the error for debug
                console.error('Geocoding error:', Object.keys(error));

                // Handle network errors or other unexpected issues
                if (error.response) {
                    // API responded with an error status and possibly an error message
                    console.error('Geocoding API response error:', error.response.data.error_message);

                    // You might want to throw different errors based on the response status code
                    if (error.response.status === 403) {
                        throw new Error('geocode_permission_denied');
                    } else {
                        throw new Error('geocode_api_error');
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('No response received from Geocoding API');
                    throw new Error('geocode_no_response');
                } else {
                    // Something else happened in setting up the request that triggered an error
                    console.error('Error setting up geocode request:', error.message);
                    throw new Error('geocode_setup_error');
                }
            }
        }

        if (req.file) {
            // get current eventmedia image
            const { eventmedia } = await db.getEventById(event_id)

            // resize the new updated image
            req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).webp().toBuffer()

            // upload to s3 and get key
            const image_key = await uploadImageS3Url(req.file, 'event-media')

            // check the outgoing image and delete it from s3 if needed
            if (eventmedia) {
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
        const { event_id } = req.params
        const current_event = await db.getEventById(event_id)

        if(current_event === undefined) {
            throw new Error('event_not_found')
        } else {
            const deleteResponse = await db.removeEvent(event_id)
    
            if (deleteResponse >= 1) {
                // check for image hosted on s3 and delete if found
                if (current_event?.eventmedia) {
                    await deleteImageS3(current_event?.eventmedia)
                }
                
                res.status(200).json({ eventname: current_event?.eventname });
            } else {
                throw new Error('event_not_found')
            }
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
        const new_event = {
            eventname: req.body.eventname,
            place_id: req.body.place_id,
            eventdate: req.body.eventdate,
            eventstart: req.body.eventstart,
            eventend: req.body.eventend,
            eventmedia: req.body.eventmedia,
            details: req.body.details,
            host_business: req.body.host_business,
            
            created_by: req.user_decoded,
            active_event: true,
        }

        // check for place id and set formatted address
        if (new_event?.place_id) {
            try {
                const geocodeResponse = await updatedGoogleMapsClient.geocode({
                    params: { place_id: new_event.place_id, key: process.env.GEOCODER_API_KEY },
                    timeout: 1000
                });

                if (geocodeResponse?.data?.status === 'OK' && geocodeResponse?.data?.results.length > 0) {
                    
                    let formatted_address = geocodeResponse?.data?.results[0]?.formatted_address.replace(', USA', '');
                    new_event.formatted_address = formatted_address;
                } else {
                    throw new Error('geocode_failed')
                }
            } catch (error) {
                // log the error for debug
                console.error('Geocoding error:', Object.keys(error));

                // Handle network errors or other unexpected issues
                if (error.response) {
                    // API responded with an error status and possibly an error message
                    console.error('Geocoding API response error:', error.response.data.error_message);

                    // You might want to throw different errors based on the response status code
                    if (error.response.status === 403) {
                        throw new Error('geocode_permission_denied');
                    } else {
                        throw new Error('geocode_api_error');
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('No response received from Geocoding API');
                    throw new Error('geocode_no_response');
                } else {
                    // Something else happened in setting up the request that triggered an error
                    console.error('Error setting up geocode request:', error.message);
                    throw new Error('geocode_setup_error');
                }
            }
        } else {
            throw new Error('missing_event_location')
        }

        if (!req.file) throw new Error('missing_eventmedia')
        
        // resize the image
        req.file.buffer = await sharp(req.file.buffer).resize({ width: 500, fit: 'contain' }).webp().toBuffer()
        
        // upload the image to s3
        const image_key = await uploadImageS3Url(req.file, 'event-media')
        
        // if(!image_key) throw new Error('upload_error')
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