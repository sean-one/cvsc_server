const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    findUserEvents,
    createEvent,
    updateImage,
    updateEvent,
    removeEventBusiness,
    removeEvent
};

//! main calendar event call
function find() {
    return db('events')
        .where('events.eventdate', '>=', new Date())
        // remove inactive events from event list return
        .andWhere({ active_event: true })
        .join('locations', 'events.venue_id', '=', 'locations.venue_id')
        .join('businesses', 'events.brand_id', '=', 'businesses.id')
        .join('users', 'events.created_by', '=', 'users.id')
        .select(
            [
                'events.id as event_id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.venue_id',
                'locations.venue_name',
                'locations.street_address',
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by',
                'users.username as event_creator'
            ]
        )

}

//! used inside jwt_helper eventCreator
async function findById(eventId) {
    return await db('events')
        .where({ 'events.id': eventId })
        .leftJoin('locations', 'events.venue_id', '=', 'locations.venue_id')
        .leftJoin('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id as event_id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.venue_id',
                'locations.venue_name',
                'locations.street_address',
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
        .first()
}


// eventRoute - .post('/')
async function createEvent(event) {
    return await db('events').insert(event, ['id'])
        .then(eventId => {
            const id = eventId[0].id;
            return db('events')
                .where('events.id', id)
                .join('locations', 'events.venue_id', '=', 'locations.venue_id')
                .join('businesses', 'events.brand_id', '=', 'businesses.id')
                .select(
                    [
                        'events.id as event_id',
                        'events.eventname',
                        'events.eventdate',
                        'events.eventstart',
                        'events.eventend',
                        'events.eventmedia',
                        'events.details',
                        'events.venue_id',
                        'locations.venue_name',
                        'locations.street_address',
                        'locations.location_city',
                        'locations.formatted',
                        'events.brand_id',
                        'businesses.business_name as brand_name',
                        'events.created_by'
                    ]
                )
                .first()
        })
        .catch(err => {
            // console.log(err)
            if(err?.code === '23502') {
                // err.column is created_by for no admin
                throw new Error('invalid_admin')
            }

            if(err?.routine === 'DecodeDateTime') {
                throw new Error('invalid_time_format')
            }

            if(err?.constraint === 'events_eventname_unique') {
                throw new Error('events_eventname_unique')
            } else {
                console.log('uncaught error inside create event model')
                throw err
            }
        })
}

//! adds an image to a created event during create process
// doing this separtely allows me to make sure the event is valid prior to uploading to s3
async function updateImage(event_id, image_update) {
    try {
        await db('events').where({ id: event_id }).update({ eventmedia: image_update })
        
        return db('events')
            .where('events.id', event_id)
            .join('locations', 'events.venue_id', '=', 'locations.venue_id')
            .join('businesses', 'events.brand_id', '=', 'businesses.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.details',
                    'events.venue_id',
                    'locations.venue_name',
                    'locations.street_address',
                    'locations.location_city',
                    'locations.formatted',
                    'events.brand_id',
                    'businesses.business_name as brand_name',
                    'events.created_by'
                ]
            )
            .first()

    } catch (error) {
        console.log(error)
    }

}

//! updates event
async function updateEvent(event_id, eventChanges) {
    try {
        const updated_event = await db('events').where({ id: event_id }).update(eventChanges, ['id', 'brand_id', 'venue_id'])
        const { id, brand_id, venue_id} = updated_event[0]

        if(brand_id !== null && venue_id !== null) {
            await db('events').where({ id: id }).update({ active_event: true })
        }

        return db('events')
            .where('events.id', id)
            .join('locations', 'events.venue_id', '=', 'locations.venue_id')
            .join('businesses', 'events.brand_id', '=', 'businesses.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.details',
                    'events.venue_id',
                    'locations.venue_name',
                    'locations.street_address',
                    'locations.location_city',
                    'locations.formatted',
                    'events.brand_id',
                    'businesses.business_name as brand_name',
                    'events.created_by'
                ]
            )
            .first()
        
    } catch (error) {
        if(error?.constraint === 'events_eventname_unique') {
            throw new Error('events_eventname_unique')
        }
    
        if(error?.routine === 'DateTimeParseError') {
            throw new Error('invalid_date_format')
        }
    
        if(error?.routine === 'pg_strtoint32') {
            throw new Error('invalid_time_format')
        }
    
        if(error?.routine === 'string_to_uuid') {
            throw new Error('invalid_business_id')
        }
        console.log(error)
        
    }
}

//! remove event
function removeEvent(event_id) {
    return db('events')
        .where({ id: event_id })
        .first()
        .del()
}

// remove business from event and mark active_event to false
async function removeEventBusiness(event_id, business_type) {
    console.log(event_id, business_type)
    if(business_type === 'venue') {
        return await db('events')
            .where({ id: event_id })
            .update({
                venue_id: null,
                venue_name: null,
                active_event: false
            })

    } else if(business_type === 'brand') {
        return await db('events')
            .where({ id: event_id })
            .update({
                brand_id: null,
                brand_name: null,
                active_event: false
            })

    } else {
        console.log(event_id, business_type)
        console.log('error inside the events model for remove business')
        return
    }
}

function findUserEvents(user) {
    return db('events')
        .where({ created_by: user })
        .andWhere('events.eventdate', '>=', new Date())
        .leftJoin('locations', 'events.venue_id', '=', 'locations.venue_id')
        .leftJoin('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id as event_id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.venue_id',
                'events.active_event',
                'locations.venue_name',
                'locations.street_address',
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
        .orderBy('events.eventdate')
}