const tokenErrors = {
    invalid_token: {
        status: 401,
        message: 'invalid token, please log in',
        type: 'token'
    },
    no_token: {
        status: 401,
        message: 'missing token, please log in',
        type: 'token'
    },
    TokenExpiredError: {
        status: 401,
        message: 'token has expired, please log in',
        type: 'token'
    },
    expired_token: {
        status: 401,
        message: 'token has expired, please log in',
        type: 'token'
    },
    invalid_user: {
        status: 400,
        message: 'invalid user rights',
        type: 'role_rights'
    },
    invalid_role: {
        status: 401,
        message: 'user does not have sufficient role rights',
        type: 'credentials'
    },
    missing_role: {
        status: 401,
        message: 'user does not have sufficient role rights',
        type: 'credentials'
    },
    // inside eventCreator when eventDB.findById fired - error
    TypeError: {
        status: 400,
        message: 'invalid event'
    },
    request_not_found : {
        status: 404,
        message: 'role request not found'
    },
    invalid_request : {
        status: 404,
        message: 'request is incorrectly formatted'
    },
    event_not_found: {
        status: 404,
        message: 'event not found'
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
        message: 'matching role rights not found',
        // type: 'role_validation'
    }
}

module.exports = tokenErrors;