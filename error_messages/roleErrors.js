const roleErrors = {
    // .get('ROLES/businesses/:business_id/user-role) - if no role is found
    role_not_found: {
        status: 404,
        message: 'user business role not found',
        type: 'server'
    },
    // .get('ROLES/users/:user_id') - user_id in url param does not match user id in token
    invalid_user: {
        status: 400,
        message: 'invalid matching user request',
        type: 'server'
    },
    roles_user_id_business_id_unique: {
        status: 400,
        message: 'request already pending',
        type: 'duplicate'
    },
    string_to_uuid: {
        status: 404,
        message: 'invalid business id',
        type: 'business not found'
    },
    business_request_closed: {
        status: 400,
        message: 'business not currently excepting request',
        type: 'business request closed'
    },
    missing_input: {
        status: 400,
        message: 'missing business id',
        type: 'missing_input'
    },
    roles_business_id_foreign: {
        status: 404,
        message: 'business not found'
    },
    roles_user_id_foreign: {
        status: 404,
        message: 'user not found'
    },
    delete_error: {
        status: 400,
        message: 'bad request error'
    }
}

module.exports = roleErrors;