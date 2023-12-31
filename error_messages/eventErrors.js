const eventErrors = {
    // .get('EVENTS/:event_id'), .delete('EVENTS/:event_id')
    event_not_found: {
        status: 404,
        message: 'unable to find event by event id',
        type: 'server'
    },
    // event model - createEvent, updateEvent
    events_eventname_unique: {
        status: 400,
        message: 'eventname already exist',
        type: 'eventname'
    },
    // .get('EVENTS/user/:user_id') - user_id in url param does not match user id in token
    invalid_user: {
        status: 400,
        message: 'invalid matching user request',
        type: 'server'
    },
    // event model / createEvent, updateEvent - invalid formatting of time of db insert
    invalid_time_format: {
        status: 400,
        message: 'please be sure time has correct formatting',
        type: 'server'
    },
    // event model - updateEvent
    invalid_business_id: {
        status: 400,
        message: 'invalid business',
        type: 'server',
    },
    // event model - updateEvent
    invalid_date_format: {
        status: 400,
        message: 'please be sure date has correct formatting',
        type: 'eventdate'
    },
    // event model - createEvent
    invalid_admin: {
        status: 400,
        message: 'unauthorized admin',
        type: 'server'
    },
    // .post('EVENTS/) - image missing from request
    missing_image: {
        status: 400,
        message: 'Image required',
        type: 'eventmedia'
    },
    //! used in event routes
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'media_error'
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
}

module.exports = eventErrors;