const db = require('../dbConfig');

module.exports = {
    find,
    findByLocation,
    findByBrand,
    findByCreator
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
                'events.start',
                'events.end',
                'events.media',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name'
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
                'events.start',
                'events.end',
                'events.media',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name'
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
                'events.start',
                'events.end',
                'events.media',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name'
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
                'events.start',
                'events.end',
                'events.media',
                'events.details',
                'events.location_id',
                'locations.venue_name',
                'locations.street',
                'locations.city',
                'locations.formatted',
                'events.brand_id',
                'businesses.name'
            ]
        )
}