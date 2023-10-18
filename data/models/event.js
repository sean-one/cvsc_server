const db = require('../dbConfig');

module.exports = {
    getBusinessEvents,
    getUserEvents,
    getEventById,
    getAllEvents,
    createEvent,
    updateEvent,
    removeEventBusiness,
    removeEvent,
    removeBusinessByType,


    checkEventName,
    validateCreatedBy,
};

// .get('/events/business/:user_id')
function getBusinessEvents(business_id) {
    return db('events')
        // Ensure eventdate and eventstart are in the future
        .whereRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
        // Match either brand_id or venue_id with the provided business_id
        .andWhere(function () {
            this.where('events.brand_id', '=', business_id)
                .orWhere('events.venue_id', '=', business_id)
        })
        // Remove inactive events from event list return
        .andWhere({ active_event: true })
        .join('businesses as venue', 'events.venue_id', '=', 'venue.id')
        .join('businesses as brand', 'events.brand_id', '=', 'brand.id')
        .join('users', 'events.created_by', '=', 'users.id')
        .select([
            'events.id as event_id',
            'events.eventname',
            'events.eventdate',
            'events.eventstart',
            'events.eventend',
            'events.eventmedia',
            'events.details',
            'events.active_event',

            'venue.id as venue_id',
            'venue.business_name as venue_name',
            'venue.formatted_address as venue_location',

            'brand.id as brand_id',
            'brand.business_name as brand_name',

            'events.created_by',
            'users.username as event_creator'
        ])
        // Order by combined timestamp of eventdate and reformatted eventstart
        .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
}

// .get('/events/user/:user_id')
function getUserEvents(user) {
    return db('events')
        .where({ created_by: user })
        .andWhere('events.eventdate', '>=', new Date())
        .leftJoin('businesses as venue', 'events.venue_id', '=', 'venue.id')
        .leftJoin('businesses as brand', 'events.brand_id', '=', 'brand.id')
        .select(
            [
                'events.id as event_id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.active_event',

                'venue.id as venue_id',
                'venue.business_name as venue_name',
                'venue.formatted_address as venue_location',

                'brand.id as brand_id',
                'brand.business_name as brand_name',

                'events.created_by',
            ]
        )
        .orderBy(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`)
}

//! main calendar event call
function getAllEvents() {
    return db('events')
        // Ensure eventdate and eventstart are in the future
        .whereRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
        // Remove inactive events from event list return
        .andWhere({ active_event: true })
        .join('businesses as venue', 'events.venue_id', '=', 'venue.id')
        .join('businesses as brand', 'events.brand_id', '=', 'brand.id')
        .join('users', 'events.created_by', '=', 'users.id')
        .select([
            'events.id as event_id',
            'events.eventname',
            'events.eventdate',
            'events.eventstart',
            'events.eventend',
            'events.eventmedia',
            'events.details',
            'events.active_event',

            'venue.id as venue_id',
            'venue.business_name as venue_name',
            'venue.formatted_address as venue_location',

            'brand.id as brand_id',
            'brand.business_name as brand_name',

            'events.created_by',
            'users.username as event_creator'
        ])
        // Order by combined timestamp of eventdate and reformatted eventstart
        .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
}

// validateEventUpdate & .get('/:event_id')
async function getEventById(eventId) {
    return await db('events')
        .where({ 'events.id': eventId })
        .leftJoin('businesses as venue', 'events.venue_id', '=', 'venue.id')
        .leftJoin('businesses as brand', 'events.brand_id', '=', 'brand.id')
        .select(
            [
                'events.id as event_id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.active_event',
                
                'venue.id as venue_id',
                'venue.business_name as venue_name',
                'venue.formatted_address as venue_location',
                
                'brand.id as brand_id',
                'brand.business_name as brand_name',

                'events.created_by',
            ]
        )
        .first()
}

// .post('/') - create new event
async function createEvent(event) {
    return await db('events').insert(event, ['id'])
        .then(eventId => {
            const id = eventId[0].id;
            return db('events')
                .where('events.id', id)
                .join('businesses as venue', 'events.venue_id', '=', 'venue.id')
                .join('businesses as brand', 'events.brand_id', '=', 'brand.id')
                .select(
                    [
                        'events.id as event_id',
                        'events.eventname',
                        'events.eventdate',
                        'events.eventstart',
                        'events.eventend',
                        'events.eventmedia',
                        'events.details',
                        'events.active_event',

                        'venue.id as venue_id',
                        'venue.business_name as venue_name',
                        'venue.formatted_address as venue_location',
                        
                        'brand.id as brand_id',
                        'brand.business_name as brand_name',

                        'events.created_by',
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

// .put('/:event_id') - update event
async function updateEvent(event_id, eventChanges) {
    try {
        const updated_event = await db('events').where({ id: event_id }).update(eventChanges, ['id', 'brand_id', 'venue_id'])
        const { id, brand_id, venue_id} = updated_event[0]

        if(brand_id !== null && venue_id !== null) {
            await db('events').where({ id: id }).update({ active_event: true })
        }

        return db('events')
            .where('events.id', id)
            .join('businesses as venue', 'events.venue_id', '=', 'venue.id')
            .join('businesses as brand', 'events.brand_id', '=', 'brand.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.details',
                    'events.active_event',

                    'venue.id as venue_id',
                    'venue.business_name as venue_name',
                    'venue.formatted_address as venue_location',

                    'brand.id as brand_id',
                    'brand.business_name as brand_name',

                    'events.created_by',
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

// when a business adjust its business type between brand and venue,
// business is removed from upcoming events that do not match new business type
async function removeBusinessByType(business_id, business_type) {
    if(business_type === 'venue') {
        return await db('events')
            .where({ venue_id: business_id })
            .update({
                venue_id: null,
                active_event: false
            })

    } else if(business_type === 'brand') {
        return await db('events')
            .where({ brand_id: business_id })
            .update({
                brand_id: null,
                active_event: false
            })

    } else {
        console.log('error inside the events model for remove business')
        return
    }
}

// remove business from event and mark active_event to false
async function removeEventBusiness(event_id, business_type) {
    console.log(event_id, business_type)
    if(business_type === 'venue') {
        return await db('events')
            .where({ id: event_id })
            .update({
                venue_id: null,
                active_event: false
            })

    } else if(business_type === 'brand') {
        return await db('events')
            .where({ id: event_id })
            .update({
                brand_id: null,
                active_event: false
            })

    } else {
        console.log(event_id, business_type)
        console.log('error inside the events model for remove business')
        return
    }
}



//! VALIDATION HELPERS - validators.js
// isEventNameUnique
async function checkEventName(eventname) {
    return db('events')
        .where(db.raw('LOWER(eventname) ILIKE ?', eventname.toLowerCase()))
        .select([ 'events.id' ])
        .first()
}

// validateEventCreator
async function validateCreatedBy(eventId) {
    return await db('events')
        .where({ 'events.id': eventId })
        .select([ 'events.created_by' ])
        .first()
}