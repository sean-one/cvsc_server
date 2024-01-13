const businessErrors = {
    // if business not found at get('/:business_id)
    business_not_found: {
        status: 404,
        message: 'Unable to find business.',
        type: 'business_error'
    },
    // if no changes are found at .put('/:business_id')
    no_changes: {
        status: 400,
        message: 'no updates or changes made',
        type: 'server'
    },
    // if there is an error with geocode place_id request
    invalid_place_id: {
        status: 400,
        message: 'Invalid request, invalid place_id parameter',
        type: 'server'
    },
    // if there is an error geocode api key
    geocode_error: {
        status: 403,
        message: 'provided api key is invalid',
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
        message: 'a server error has occured',
        type: 'server'
    },
    businesses_business_name_unique: {
        status: 409,
        message: 'business name already registered',
        type: 'business_name'
    },
    businesses_business_admin_foreign: {
        status: 404,
        message: 'user not found'
    },
    // .put('/update/:business_id')
    business_address_required: {
        status: 400,
        message: 'business type must have a valid address',
        type: 'formatted_address'
    },
    // .post('/create')
    missing_image: {
        status: 400,
        message: 'Business branding (logo) required',
        type: 'business_avatar'
    },
    invalid_business_type: {
        status: 400,
        message: 'invalid business type submitted',
        type: 'business_type'
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
    invalid_toggle_type: {
        status: 400,
        message: 'invalid toggle type request',
        type: 'server'
    },
    // .delete('/:business_id')
    delete_failed: {
        status: 400,
        message: 'business delete failed',
        type: 'server'
    }
}

module.exports = businessErrors;