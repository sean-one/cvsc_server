const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    findByBusiness,
    findByLocation,
    findByBrand,
    findByCreator,
    createEvent,
    updateEvent,
    removeBusiness,
    removeEvent
};

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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by',
                'users.username as event_creator'
            ]
        )

}

// used inside validateEventEditRights
function findById(eventId) {
    return db('events')
        .where({ 'events.id' : eventId })
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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
        .first()
}

function findByBusiness(id) {
    return db('events')
        .where({ 'events.venue_id' : id })
        .orWhere({ 'events.brand_id' : id })
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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
        .orderBy('events.eventdate')
}

function findByLocation(venue) {
    return db('events')
        .where({ 'events.venue_id' : venue })
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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
}

function findByBrand(brand) {
    return db('events')
        .where({ brand_id : brand })
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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
}

function findByCreator(user) {
    return db('events')
        .where({ created_by : user })
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
                'locations.location_city',
                'locations.formatted',
                'events.brand_id',
                'businesses.business_name as brand_name',
                'events.created_by'
            ]
        )
        .orderBy('events.eventdate')
}

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
                        'locations.location_city',
                        'locations.formatted',
                        'events.brand_id',
                        'businesses.business_name as brand_name',
                        'events.created_by'
                    ]
                )
                .first()
        })
        .catch(err => {throw err})
}

async function updateEvent(eventId, eventChanges) {
    return await db('events').where({ id: eventId }).update(eventChanges, ['id'])
        .then(eventId => {
            const { id } = eventId[0]
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
                        'locations.location_city',
                        'locations.formatted',
                        'events.brand_id',
                        'businesses.business_name as brand_name',
                        'events.created_by'
                    ]
                )
                .first()
        })
}

async function removeBusiness(event_id, business_type) {
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

function removeEvent(user_id, event_id) {
    // console.log(details)
    // console.log('inside remove')
    return db('events')
        .where({ created_by: user_id })
        .andWhere(function() {
            this.where({ id: event_id })
        })
        .first()
        .del()
}