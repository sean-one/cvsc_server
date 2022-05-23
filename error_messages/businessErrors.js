const businessErrors = {
    contacts_email_unique: {
        status: 400,
        message: 'duplicate email not valid'
    },
    locations_place_id_unique: {
        status: 400,
        message: 'duplicate address not valid'
    },
    businesses_name_unique: {
        status: 400,
        message: 'duplicate business name not valid'
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
    
}

module.exports = businessErrors;