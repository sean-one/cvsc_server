const eventErrors = {
    // .post('EVENTS/) - image missing from request
    missing_eventmedia: {
        status: 400,
        message: 'an event image is required',
        type: 'eventmedia'
    },
    // .post('EVENTS/') - missing event location
    missing_event_location: {
        status: 400,
        message: 'an event must have a location',
        type: 'place_id'
    },
    // .get('EVENTS/:event_id')
    //! .delete('EVENTS/:event_id')
    event_not_found: {
        status: 404,
        message: 'unable to find event by event id',
        type: 'server'
    },



    // event model - updateEvent
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
    // event model / updateEvent - invalid formatting of time of db insert
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
    // .put('EVENTS/:event_id') - error uploading image to s3 bucket
    upload_error: {
        status: 400,
        message: 'an error occured during image upload',
        type: 'media_error'
    },
    delete_error: {
        status: 400,
        message: 'event delete failed on server',
        type: 'server'
    },
    // event models generic try catch error
    server_error: {
        status: 500,
        message: 'an internal server error occurred',
        type: 'server'

    },
    //! constrain error from event model
    events_created_by_foreign: {
        status: 404,
        message: 'user not found',
        type: 'server'
    },

    // geocoding errors
    geocode_failed: {
        status: 400,
        message: 'geocode place id call failed',
        type: 'server'
    },
    geocode_permission_denied: {
        status: 400,
        message: 'geocode permission denied',
        type: 'server'
    },
    geocode_api_error: {
        status: 400,
        message: 'geocode fetch error',
        type: 'server'
    },
    geocode_no_response: {
        status: 400,
        message: 'no response from geocode',
        type: 'server'
    },
    geocode_setup_error: {
        status: 400,
        message: 'error setting up geocode request',
        type: 'server'
    },


    // aws s3 errors
    aws_invalid_access_key: {
        status: 400,
        message: 'invalid s3 access key',
        type: 'server'
    },
    aws_invalid_bucket: {
        status: 400,
        message: 'invalid s3 bucket',
        type: 'server'
    },
    aws_upload_error: {
        status: 400,
        message: 'failed to upload image to s3',
        type: 'server'
    },
    aws_delete_error: {
        status: 400,
        message: 'faled to delete image from s3',
        type: 'server'
    },

    // generic server errors
    create_event_server_error: {
        status: 400,
        message: 'server error while creating event',
        type: 'server'
    },
    fetch_all_events_server_error: {
        status: 400,
        message: 'server error wile fetching all events',
        type: 'server'
    },
    event_find_id_server_error: {
        status: 400,
        message: 'server error finding event by id',
        type: 'server'
    }
}

module.exports = eventErrors;