const db = require('../dbConfig');

module.exports = {
    find,
    findByLocation,
    findByBrand,
    findByCreator,
    createEvent
};

function find() {
    return db('events')
        .join('locations', 'events.location_id', '=', 'locations.id')
        .join('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name',
                'events.created_by'
            ]
        )

}

function findByLocation(location) {
    return db('events')
        .where({ location_id : location })
        .join('locations', 'events.location_id', '=', 'locations.id')
        .join('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name',
                'events.created_by'
            ]
        )
}

function findByBrand(brand) {
    return db('events')
        .where({ brand_id : brand })
        .join('locations', 'events.location_id', '=', 'locations.id')
        .join('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name',
                'events.created_by'
            ]
        )
}

function findByCreator(user) {
    return db('events')
        .where({ created_by : user })
        .join('locations', 'events.location_id', '=', 'locations.id')
        .join('businesses', 'events.brand_id', '=', 'businesses.id')
        .select(
            [
                'events.id',
                'events.eventname',
                'events.eventdate',
                'events.eventstart',
                'events.eventend',
                'events.eventmedia',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name',
                'events.created_by'
            ]
        )
}

async function createEvent(event) {
    return await db('events')
        .insert(
            event,
            [
                'id',
                'eventname',
                'eventdate',
                'eventstart',
                'eventend',
                'eventmedia',
                'brand_id',
                'location_id'
            ]
        )
}