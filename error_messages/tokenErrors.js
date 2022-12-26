const tokenErrors = {
    invalid_token: {
        status: 401,
        message: 'missing or invalid token, please log in',
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
        message: 'invalid user rights'
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
        message: 'invalid request'
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