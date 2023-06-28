const businessErrors = {
    contacts_email_unique: {
        status: 400,
        message: 'duplicate email not valid'
    },
    locations_place_id_unique: {
        status: 400,
        message: 'duplicate address not valid'
    },
    businesses_business_name_unique: {
        status: 409,
        message: 'business name already registered',
        type: 'business_name'
    },
    businesses_contact_id_foreign: {
        status: 404,
        message: 'contact not found'
    },
    businesses_business_admin_foreign: {
        status: 404,
        message: 'user not found'
    },
    brand_address_not_valid: {
        status: 400,
        message: 'brand address is not valid'
    },
    business_address_required: {
        status: 400,
        message: 'business must have a valid address'
    },
    // .post('/create')
    missing_image: {
        status: 400,
        message: 'business branding logo required',
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
    // .post('/create')
    missing_admin: {
        status: 401,
        message: 'missing business admin',
        type: 'server'
    }
}

module.exports = businessErrors;