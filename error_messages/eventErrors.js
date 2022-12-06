const eventErrors = {
    events_eventname_unique: {
        status: 400,
        message: 'eventname already exist',
        type: 'eventname'
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
    },
    invalid_time_format: {
        // invalid formatting of time on insert
        status: 400,
        message: 'please be sure time has correct formatting',
        type: 'time_format'
    },
    invalid_business_id: {
        status: 400,
        message: 'please be sure business ID is correct',
        type: 'server',
    },
    invalid_date_format: {
        status: 400,
        message: 'please be sure date has correct formatting',
        type: 'eventdate'
    },
    invalid_admin: {
        status: 401,
        message: 'unauthorized',
    },
    missing_image: {
        status: 400,
        message: 'image error',
        type: 'eventmedia'
    },
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'eventmedia'
    },
}

module.exports = eventErrors;