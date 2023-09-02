const businessErrors = {
    business_not_found: {
        status: 404,
        message: 'unable to find business by id',
        type: 'validation'
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
        message: 'business must have a valid address'
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
}

module.exports = businessErrors;