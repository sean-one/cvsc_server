const eventErrors = {
    events_eventname_unique: {
        status: 400,
        message: 'eventname already exist'
    },
    events_venue_id_foreign: {
        status: 404,
        message: 'venue not found'
    },
    events_brand_id_foreign: {
        status: 404,
        message: 'brand not found'
    },
    events_created_by_foreign: {
        status: 404,
        message: 'user not found'
    }
}

module.exports = eventErrors;