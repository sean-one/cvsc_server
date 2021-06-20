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
        .where({ id: eventId })
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

function findByLocation(venue) {
    console.log(venue)
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
        .catch(err => console.log(err))
}

function removeEvent(details) {
    console.log('inside remove')
    return db('events')
        .where({ id: details.event, created_by: details.user })
        .first()
        .del()
}