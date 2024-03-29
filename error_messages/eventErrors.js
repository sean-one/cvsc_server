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
    // .get('EVENTS/:event_id') .delete('EVENTS/:event_id')
    event_not_found: {
        status: 404,
        message: 'unable to find event by event id',
        type: 'server'
    },
    // .get('EVENTS/user/:user_id') - user_id in url param does not match user id in token
    invalid_user: {
        status: 400,
        message: 'invalid matching user request',
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
    fetch_business_events_server_error: {
        status: 400,
        message: 'server error while fetching business events',
        type: 'server'
    },
    fetch_user_events_server_error: {
        status: 400,
        message: 'sever error while fetching user events',
        type: 'server'
    },
    fetch_all_events_server_error: {
        status: 400,
        message: 'server error while fetching all events',
        type: 'server'
    },
    fetch_related_events_server_error: {
        status: 400,
        message: 'server error while fetching related events',
        type: 'server'
    },
    event_find_id_server_error: {
        status: 400,
        message: 'server error finding event by id',
        type: 'server'
    },
    update_event_server_error: {
        status: 400,
        message: 'server error updating event',
        type: 'server'
    },
    delete_event_server_error: {
        status: 400,
        message: 'server error deleting event',
        type: 'server'
    }
}

module.exports = eventErrors;