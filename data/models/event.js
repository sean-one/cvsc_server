const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    findByLocation,
    findByBrand,
    findByCreator,
    createEvent,
    removeEvent
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

function findById(eventId) {
    return db('events')
        .where({ id: eventId })
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
    return await db('events').insert(event, ['id'])
        .then(eventId => {
            const id = eventId[0].id;
            return db('events')
                .where('events.id', id)
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
                .first()
        })
        .catch(err => console.log(err))
}

function removeEvent(details) {
    console.log('inside remove')
    return db('events')
        .where({ id: details.event, created_by: details.user })
        .first()
        .del()
}