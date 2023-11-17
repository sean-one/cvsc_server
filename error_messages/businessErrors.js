const businessErrors = {
    // if business not found at get('single/:business_id)
    business_not_found: {
        status: 404,
        message: 'Unable to find business.',
        type: 'business_error'
    },
    // getBusinessManagement
    string_to_uuid: {
        status: 400,
        message: 'invalid user id credentials',
        type: 'server'
    },
    // getBusinessManagement
    non_manager: {
        status: 404,
        message: 'no managing businesses found',
        type: 'server'
    },
    // getBusinessManagement
    server_error: {
        status: 500,
        message: 'server error',
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
    }
}

module.exports = businessErrors;