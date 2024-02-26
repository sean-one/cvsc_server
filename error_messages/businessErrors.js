const businessErrors = {
    // .get('/:business_id)
    business_not_found: {
        status: 404,
        message: 'unable to locate business by identifier',
        type: 'server'
    },
    // if no changes are found at .put('/:business_id')
    empty_update_object: {
        status: 400,
        message: 'no updates or changes made',
        type: 'server'
    },
    // .get('/managed') - user id invalid format
    string_to_uuid: {
        status: 400,
        message: 'invalid identifying format',
        type: 'server'
    },
    // .get('/managed') - no roles with manager or admin
    non_manager: {
        status: 404,
        message: 'no business management roles found',
        type: 'server'
    },
    // .get('/managed') - fallback for server error
    server_error: {
        status: 400,
        message: 'an internal server error has occured',
        type: 'server'
    },
    // business database error.contraint
    businesses_business_name_unique: {
        status: 409,
        message: 'business name already registered',
        type: 'business_name'
    },
    // business database error.constraint
    businesses_business_admin_foreign: {
        status: 400,
        message: 'unable to locate user admin by identifier',
        type: 'server'
    },
    // .post('BUSINESSES/')
    missing_image: {
        status: 400,
        message: 'business logo is required',
        type: 'business_avatar'
    },
    // .post('/create')
    missing_incomplete: {
        status: 400,
        message: 'missing and/or invalid inputs',
        type: 'server'
    },
    // .post('/create')
    missing_location: {
        status: 400,
        message: 'missing location address',
        type: 'server'
    },
    // .put('/:business_id/toggle)
    business_toggle_error: {
        status: 400,
        message: 'invalid business toggle type',
        type: 'server'
    },
    // .delete('/:business_id')
    delete_failed: {
        status: 400,
        message: 'business delete failed',
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
    create_business_server_error: {
        status: 400,
        message: 'server error while creating business',
        type: 'server'
    },
    business_find_id_server_error: {
        status: 400,
        message: 'server error finding business by id',
        type: 'server'
    },
    fetch_all_businesses_server_error: {
        status: 400,
        message: 'server error fetching all businesses',
        type: 'server'
    },
    active_business_toggle_server_error: {
        status: 400,
        message: 'server error occured during active business status toggle',
        type: 'server'
    },
    business_request_toggle_server_error: {
        status: 400,
        message: 'server error occured during business request status toggle',
        type: 'server'
    }
}

module.exports = businessErrors;