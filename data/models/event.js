const db = require('../dbConfig');

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    removeEvent,
    getUserEvents,
    getBusinessEvents,
    getEventRelatedEvents,


    checkEventName,
    validateCreatedBy,
};

// .get('EVENTS/business/:business_id') - returns array of ACTIVE events for specific business id
async function getBusinessEvents(business_id) {
    try {
        return await db('events')
            // Ensure eventdate and eventstart are in the future
            .whereRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            // Match either brand_id or venue_id with the provided business_id
            .andWhere('events.host_business', '=', business_id)
            // Remove inactive events from event list return
            .andWhere({ active_event: true })
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .join('users', 'events.created_by', '=', 'users.id')
            .select([
                'events.id as event_id',
                'events.eventname',
                'events.place_id',
                'events.formatted_address',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.host_business',
                'businesses.business_name',
                'events.details',
                'events.active_event',
    
                'events.created_by',
                'users.username as event_creator'
            ])
            // Order by combined timestamp of eventdate and reformatted eventstart
            .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
    } catch (error) {
        console.error('Error fetching business events:', Object.keys(error));
        throw new Error('fetch_business_events_server_error');
    }
}

// .get('EVENTS/event-related/:event_id) - returns array of ACTIVE events for specific event id (all events that include venue and brand)
async function getEventRelatedEvents(event_id) {
    try {
        const { place_id } = await db('events').where({ 'events.id': event_id }).first()
        
        return await db('events')
            // Ensure eventdate and eventstart are in the future
            .whereRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            .andWhere('events.place_id', '=', place_id)
            .andWhere('events.active_event', true)
            .andWhereNot('events.id', event_id)
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .join('users', 'events.created_by', '=', 'users.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.place_id',
                    'events.formatted_address',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.host_business',
                    'businesses.business_name',
                    'events.details',
                    'events.active_event',


                    'events.created_by',
                    'users.username as event_creator'
                ]
            )
            // Order by combined timestamp of eventdate and reformatted eventstart
            .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);

    } catch (error) {
        console.error('Error fetching event related events', Object.keys(error));
        throw new Error('fetch_related_events_server_error');
    }
}

// .get('EVENTS/user/:user_id')
async function getUserEvents(user_id) {
    try {
        return await db('events')
            .where({ created_by: user_id })
            .andWhere('events.eventdate', '>=', new Date())
            .join('users', 'events.created_by', '=', 'users.id')
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.place_id',
                    'events.formatted_address',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.host_business',
                    'businesses.business_name',
                    'events.details',


                    'events.active_event',
                    'events.created_by',
                    'users.username as event_creator'
                ]
            )
            .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`)
    } catch (error) {
        console.error('Error fetching related user events:', error);
        throw new Error('fetch_user_events_server_error');
    }
}

// .get('EVENTS/') - returns all active upcoming events
async function getAllEvents() {
    try {
        return await db('events')
            // Ensure eventdate and eventstart are in the future
            .whereRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            // Remove inactive events from event list return
            .andWhere({ active_event: true })
            .join('users', 'events.created_by', '=', 'users.id')
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .select([
                'events.id as event_id',
                'events.eventname',
                'events.place_id',
                'events.formatted_address',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.host_business',
                'businesses.business_name',
                'events.details',
                'events.active_event',
    
                'events.created_by',
                'users.username as event_creator'
            ])
            // Order by combined timestamp of eventdate and reformatted eventstart
            .orderByRaw(`(events.eventdate || ' ' || LPAD(events.eventstart::text, 4, '0')::time)::timestamp`);
    } catch (error) {
        console.error('Error fetching events:', Object.keys(error));
        throw new Error('fetch_all_events_server_error');
    }
}

// .get('EVENTS/:event_id') & validateEventUpdate - retuns an ACTIVE or INACTIVE event by id
async function getEventById(event_id) {
    try {
        return await db('events')
            .where({ 'events.id': event_id })
            .join('users', 'events.created_by', '=', 'users.id')
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.place_id',
                    'events.formatted_address',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.host_business',
                    'businesses.business_name',
                    'events.details',
                    'events.active_event',
    
                    'events.created_by',
                    'users.username as event_creator'
                ]
            )
            .first()
    } catch (error) {
        console.error('Error fetching event by id:', Object.keys(error));
        throw new Error('event_find_id_server_error');
    }
}

// .post('EVENTS/') - create new event
async function createEvent(event) {
    try {
        // insert the new event into database
        const new_event = await db('events')
            .insert(event, ['id'])
        
        return await db('events')
            .where({ 'events.id': new_event[0].id })
            .join('users', 'events.created_by', '=', 'users.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.place_id',
                    'events.formatted_address',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.host_business',
                    'events.details',
                    'events.active_event',

                    'events.created_by',
                    'users.username as event_creator'
                ]
            )
            .first()
        
    } catch (error) {
        console.error('Error creating new event:', Object.keys(error));
        throw new Error('create_event_server_error');
    }
}

// .put('EVENTS/:event_id') - update event
async function updateEvent(event_id, eventChanges) {
    try {
        const updated_event = await db('events').where({ id: event_id }).update(eventChanges, ['id'])
        const { id } = updated_event[0]

        return db('events')
            .where('events.id', id)
            .join('users', 'events.created_by', '=', 'users.id')
            .join('businesses', 'events.host_business', '=', 'businesses.id')
            .select(
                [
                    'events.id as event_id',
                    'events.eventname',
                    'events.place_id',
                    'events.formatted_address',
                    'events.eventdate',
                    'events.eventstart',
                    'events.eventend',
                    'events.eventmedia',
                    'events.host_business',
                    'businesses.business_name',
                    'events.details',
                    'events.active_event',

                    'events.created_by',
                    'users.username as event_creator'
                ]
            )
            .first()
        
    } catch (error) {
        console.error('Error updating event:', Object.keys(error))
        throw new Error('update_event_server_error')
        
    }
}

// .delete('EVENTS/:event_id')
async function removeEvent(event_id) {
    try {
        return await db('events').where({ id: event_id }).first().del()
        
    } catch (error) {
        console.error('Error deleting event:', Object.keys(error))
        throw new Error('delete_event_server_error')
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