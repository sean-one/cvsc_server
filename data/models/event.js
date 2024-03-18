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
        // Query for direct events
        const directEventsQuery = db('events as e')
            .select('e.id')
            .where('e.host_business', '=', business_id);

        // Query for events tagged with the business_id
        const taggedEventsQuery = db('business_tags as bt')
            .select('bt.event_id as id')
            .where('bt.business_id', '=', business_id)
            .andWhereNotNull('bt.approved_by');

        // Combine the queries to get a unified list of event IDs
        const combinedEventIDsQuery = directEventsQuery.union([taggedEventsQuery]);

        console.log(combinedEventIDsQuery)
        // Fetch the complete event records matching the combined list of event IDs
        return await db('events as e')
            .joinRaw(`JOIN (${combinedEventIDsQuery.toQuery()}) AS combined ON e.id = combined.id`)
            .leftJoin('users as u', 'e.created_by', 'u.id')
            .leftJoin('businesses as b', 'e.host_business', 'b.id')
            .leftJoin('business_tags as bt', 'e.id', 'bt.event_id')
            .select([
                'e.id as event_id',
                'e.eventname',
                'e.place_id',
                'e.formatted_address',
                'e.eventdate',
                'e.eventstart',
                'e.eventend',
                'e.eventmedia',
                'e.details',
                'e.host_business',
                'e.created_by',
                'e.active_event',
                'u.username as event_creator',
                'b.business_name',
                // Updated ARRAY_AGG to include only approved business tags
                db.raw('ARRAY_AGG(bt.business_id) FILTER (WHERE bt.business_id IS NOT NULL AND bt.approved_by IS NOT NULL) as tags'),
            ])
            .whereRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            .andWhere({ active_event: true })
            .groupBy('e.id', 'u.username', 'b.business_name')
            // Order by combined timestamp of eventdate and reformatted eventstart
            .orderByRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp`);

    } catch (error) {
        console.log(error)
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
        return await db('events as e')
            .leftJoin('users as u', 'e.created_by', 'u.id')
            .leftJoin('businesses as b', 'e.host_business', 'b.id')
            .leftJoin('business_tags as bt', 'e.id', 'bt.event_id')
            .select([
                'e.id as event_id',
                'e.eventname',
                'e.place_id',
                'e.formatted_address',
                'e.eventdate',
                'e.eventstart',
                'e.eventend',
                'e.eventmedia',
                'e.details',
                'e.host_business',
                'e.created_by',
                'e.active_event',
                'u.username as event_creator',
                'b.business_name',
                // Updated ARRAY_AGG to include only approved business tags
                db.raw('ARRAY_AGG(bt.business_id) FILTER (WHERE bt.business_id IS NOT NULL AND bt.approved_by IS NOT NULL) as tags'),
            ])
            .whereRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            .andWhere({ 'e.created_by': user_id })
            .groupBy('e.id', 'u.username', 'b.business_name')
            .orderByRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp`)
    } catch (error) {
        console.error('Error fetching related user events:', error);
        throw new Error('fetch_user_events_server_error');
    }
}

// .get('EVENTS/') - returns all active upcoming events
async function getAllEvents() {
    try {
        return await db('events as e')
            .leftJoin('users as u', 'e.created_by', 'u.id')
            .leftJoin('businesses as b', 'e.host_business', 'b.id')
            .leftJoin('business_tags as bt', 'e.id', 'bt.event_id')
            .select([
                'e.id as event_id',
                'e.eventname',
                'e.place_id',
                'e.formatted_address',
                'e.eventdate',
                'e.eventstart',
                'e.eventend',
                'e.eventmedia',
                'e.details',
                'e.host_business',
                'e.created_by',
                'e.active_event',
                'u.username as event_creator',
                'b.business_name',
                // Updated ARRAY_AGG to include only approved business tags
                db.raw('ARRAY_AGG(bt.business_id) FILTER (WHERE bt.business_id IS NOT NULL AND bt.approved_by IS NOT NULL) as tags'),
            ])
            .whereRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp >= CURRENT_TIMESTAMP`)
            .andWhere({ 'e.active_event': true })
            .groupBy('e.id', 'u.username', 'b.business_name')
            .orderByRaw(`(e.eventdate || ' ' || LPAD(e.eventstart::text, 4, '0')::time)::timestamp`);
    } catch (error) {
        console.error('Error fetching events:', error);
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
        return await db.transaction(async trx => {
            let businessTag = null
            
            // check for business tag
            if (event.business_tag) {
                // check if the user has role rights for tagged business (true/false)
                const hasRoleRights = await db('roles')
                    .transacting(trx)
                    .where({ user_id: event?.created_by, business_id: event.business_tag, active_role: true })
                    .select(['roles.id'])
                    .first()
                    .then(role => !!role)

                // create business tag as approved with user id or pending with approved_by as null
                businessTag = { business_id: event.business_tag, approved_by: hasRoleRights ? event.created_by : null };
                delete event['business_tag'];
            }
            // remove business_tag no matter what
            delete event['business_tag'];

            // insert the new event into database
            const new_event = await db('events')
                .transacting(trx)
                .insert(event, ['id'])
            
            if (businessTag) {
                // add event id from new event to business tag
                businessTag = {...businessTag, event_id: new_event[0].id }
                await db('business_tags')
                    .transacting(trx)
                    .insert(businessTag, ['id'])
            }

            return await db('events')
                .transacting(trx)
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
        })
        
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