const tokenErrors = {
    invalid_token: {
        status: 401,
        message: 'missing or invalid token, please log in'
    },
    expired_token: {
        status: 401,
        message: 'token has expired, please log in'
    },
    invalid_user: {
        status: 401,
        message: 'user does not have valid rights'
    },
    request_not_found : {
        status: 404,
        message: 'role request not found'
    },
    invalid_role_rights : {
        status: 403,
        message: 'user does not have correct role rights'
    },
    non_matching_request: {
        status: 400,
        message: 'request ids do not match'
    },
    update_failed: {
        status: 400,
        message: 'update to role request failed'
    },
    delete_failed: {
        status: 404,
        message: 'request to delete failed, please check the id'
    },
    roles_not_found: {
        status: 404,
        message: 'matching role rights not found'
    }
}

module.exports = tokenErrors;