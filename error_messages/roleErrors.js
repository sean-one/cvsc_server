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
    // roleAction - role action may only be ['approve', 'upgrade', 'downgrade']
    invalid_action: {
        status: 400,
        message: 'invalid or unknown requested action type',
        type: 'server'
    },


    // generic server errors
    get_user_account_role_server_error: {
        status: 400,
        message: 'server error getting user account role',
        type: 'server'
    },
    all_business_roles_server_error: {
        status: 400,
        message: 'server error getting all business roles',
        type: 'server'
    },
    all_user_roles_server_error: {
        status: 400,
        message: 'server error getting all user roles',
        type: 'server'
    },
    create_role_request_server_error: {
        status: 400,
        message: 'server error creating business role request',
        type: 'server'
    },
    fetch_role_id_server_error: {
        status: 400,
        message: 'server error getting role by id',
        type: 'server'
    },
    approve_role_server_error: {
        status: 400,
        message: 'server error approving role request',
        type: 'server'
    },
    upgrade_role_server_error: {
        status: 400,
        message: 'server error upgrading business role',
        type: 'server'
    },
    fetch_user_business_role_server_error: {
        status: 400,
        message: 'server error getting user business role',
        type: 'server'
    },
    downgrade_role_server_error: {
        status: 400,
        message: 'server error downgrading business role',
        type: 'server'
    },
    delete_role_server_error: {
        status: 400,
        message: 'server error deleting role',
        type: 'server'
    }
}


module.exports = roleErrors;