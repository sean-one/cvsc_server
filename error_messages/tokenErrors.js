const tokenErrors = {
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
    }
}

module.exports = tokenErrors;