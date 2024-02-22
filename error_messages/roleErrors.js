const roleErrors = {
    // .get('ROLES/businesses/:business_id/user-role) - if no role is found
    role_not_found: {
        status: 404,
        message: 'user business role not found',
        type: 'server'
    },
    // .get('ROLES/users/:user_id') - user_id in url param does not match user id in token
    invalid_user: {
        status: 401,
        message: 'user authentication server error',
        type: 'server'
    },
    missing_input: {
        status: 400,
        message: 'missing business id',
        type: 'missing_input'
    },
    // createRoleRequest insert error
    db_insert_error: {
        status: 404,
        message: 'foriegn identifiers not found',
        type: 'server'
    },
    get_business_roles_error: {
        status: 400,
        message: 'business identifier formatting error',
        type: 'server'
    },
    // roleAction - role action may only be ['approve', 'upgrade', 'downgrade']
    invalid_action: {
        status: 400,
        message: 'invalid or unknown requested action type',
        type: 'server'
    },
    roles_business_id_foreign: {
        status: 404,
        message: 'business identifier not found',
        type: 'server'
    },
    roles_user_id_foreign: {
        status: 404,
        message: 'user identifier not found',
        type: 'server'
    },
    string_to_uuid: {
        status: 400,
        message: 'role indentifier has invalid formatting',
        type: 'server'
    },
    delete_error: {
        status: 400,
        message: 'delete failed - server delete error',
        type: 'server'
    },
    server_error: {
        status: 400,
        message: 'an internal server error occurred',
        type: 'server'
    },
    // generic server errors
    get_user_account_role_server_error: {
        status: 400,
        message: 'server error getting user account role',
        type: 'server'
    },
    all_user_roles_server_error: {
        status: 400,
        message: 'server error getting all user roles',
        type: 'server'
    }
}




// database server errors
//   - roles_user_id_business_id_unique
//   - string_to_uuid
//   - business_request_closed

module.exports = roleErrors;