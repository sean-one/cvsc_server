const eventErrors = {
    //! event model error
    events_eventname_unique: {
        status: 400,
        message: 'eventname already exist',
        type: 'eventname'
    },
    //! constrain error from event model
    events_venue_id_foreign: {
        status: 404,
        message: 'venue not found',
        type: 'venue_id'
    },
    //! constrain error from event model
    events_brand_id_foreign: {
        status: 404,
        message: 'brand not found',
        type: 'brand_id'
    },
    //! constrain error from event model
    events_created_by_foreign: {
        status: 404,
        message: 'user not found',
        type: 'server'
    },
    //! event model error
    invalid_time_format: {
        // invalid formatting of time on insert
        status: 400,
        message: 'please be sure time has correct formatting',
        type: 'time_format'
    },
    //! event model error
    invalid_business_id: {
        status: 400,
        message: 'invalid business',
        type: 'server',
    },
    //! event model error
    invalid_date_format: {
        status: 400,
        message: 'please be sure date has correct formatting',
        type: 'eventdate'
    },
    //! event model error
    invalid_admin: {
        status: 400,
        message: 'unauthorized admin',
        type: 'server'
    },
    //! used in event routes
    missing_image: {
        status: 400,
        message: 'image error',
        type: 'media_error'
    },
    //! used in event routes
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'media_error'
    },
}

module.exports = eventErrors;