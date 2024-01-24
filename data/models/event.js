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

// .get('EVENTS/business/:business_id') - returns array of ACTIVE events for specific business id
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
            'venue.business_avatar as venue_logo',
            'venue.business_name as venue_name',
            'venue.formatted_address as venue_location',

            'brand.id as brand_id',
            'brand.business_avatar as brand_logo',
            'brand.business_name as brand_name',

            'events.created_by',
            'users.username as event_creator'
        ])
        // Order by combined timestamp of eventdate and reformatted eventstart
        .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
}

// .get('EVENTS/user/:user_id')
function getUserEvents(user_id) {
    return db('events')
        .where({ created_by: user_id })
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
                'venue.business_avatar as venue_logo',
                'venue.business_name as venue_name',
                'venue.formatted_address as venue_location',

                'brand.id as brand_id',
                'brand.business_avatar as brand_logo',
                'brand.business_name as brand_name',

                'events.created_by',
            ]
        )
        .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`)
}

//! main calendar event call
async function getAllEvents() {
    try {
        return await db('events')
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
                'venue.business_avatar as venue_logo',
                'venue.formatted_address as venue_location',
    
                'brand.id as brand_id',
                'brand.business_avatar as brand_logo',
                'brand.business_name as brand_name',
    
                'events.created_by',
                'users.username as event_creator'
            ])
            // Order by combined timestamp of eventdate and reformatted eventstart
            .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
    } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('server_error');
    }
}

// .get('EVENTS/:event_id') & validateEventUpdate
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
                'venue.business_avatar as venue_logo',
                'venue.formatted_address as venue_location',
                
                'brand.id as brand_id',
                'brand.business_avatar as brand_logo',
                'brand.business_name as brand_name',

                'events.created_by',
            ]
        )
        .first()
}

// .post('EVENTS/') - create new event
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
                        'venue.business_avatar as venue_logo',
                        'venue.formatted_address as venue_location',
                        
                        'brand.id as brand_id',
                        'brand.business_avatar as brand_logo',
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

// .put('EVENTS/:event_id') - update event
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
                    'venue.business_avatar as venue_logo',
                    'venue.formatted_address as venue_location',

                    'brand.id as brand_id',
                    'brand.business_avatar as brand_logo',
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

// .put('EVENTS/businesses/:business_id/events/:event_id')
async function removeEventBusiness(event_id, business_id) {
    let eventUpdates = { active_event: false }
    const current_event = await db('events').where({ id: event_id }).select(['venue_id', 'brand_id']).first()

    if (current_event.venue_id === business_id) {
        eventUpdates.venue_id = null
    }

    if (current_event.brand_id === business_id) {
        eventUpdates.brand_id = null
    }

    return db('events')
        .where({ id: event_id })
        .update(eventUpdates, ['events.id as event_id'])
}

// .delete('EVENTS/:event_id')
function removeEvent(event_id) {
    return db('events').where({ id: event_id }).first().del()
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


//! VALIDATION HELPERS - validators.js
// isEventNameUnique
async function checkEventName(eventname) {
    return db('events')
        .where(db.raw('LOWER(eventname) ILIKE ?', eventname.toLowerCase()))
        .select([ 'events.id' ])
        .first()
}

// validateEventCreator
async function validateCreatedBy(event_id, user_id) {
    return await db('events')
        .where({ 'events.id': event_id, 'events.created_by': user_id })
        .select([ 'events.id' ])
        .first()
        .then(event => !!event)
}