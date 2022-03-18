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
    removeEvent
};

function find() {
    return db('events')
        .where('events.eventdate', '>=', new Date())
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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
                'events.created_by'
            ]
        )

}

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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
                'events.created_by'
            ]
        )
}

function findByCreator(user) {
    return db('events')
        .where({ created_by : user })
        .where('events.eventdate', '>=', new Date())
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
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name as brand_name',
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
                        'locations.city',
                        'locations.formatted',
                        'events.brand_id',
                        'businesses.name as brand_name',
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
                        'locations.city',
                        'locations.formatted',
                        'events.brand_id',
                        'businesses.name as brand_name',
                        'events.created_by'
                    ]
                )
                .first()
        })
}

function removeEvent(details) {
    // console.log(details)
    // console.log('inside remove')
    return db('events')
        .where({ created_by: details.user })
        .andWhere(function() {
            this.where({ id: details.event })
        })
        .first()
        .del()
}