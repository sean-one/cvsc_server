
// used in jwt_helper -> validToken
const tokenErrors = {
    invalid_credentials: {
        status: 403,
        message: 'incorrect permissions set',
        type: 'credentials'
    },
    // missing token return 401
    no_token: {
        status: 401,
        message: 'missing token, please log in',
        type: 'token'
    },
    // invalid or expired return 403
    invalid_token: {
        status: 403,
        message: 'invalid token, please log in',
        type: 'token'
    },
    TokenExpiredError: {
        status: 403,
        message: 'token has expired, please log in',
        type: 'token'
    },
    JsonWebTokenError: {
        status: 403,
        message: 'token is invalid',
        type: 'token'
    },
    // no user_id found on token
    no_user_id: {
        status: 400,
        message: 'user identifier not valid',
        type: 'server'
    },
    // no user found by id
    user_not_found: {
        status: 404,
        message: 'unable to find user',
        type: 'server'
    },
    // user email is not verified
    not_verified: {
        status: 400,
        message: 'user email must be verified to create business',
        type: 'server'
    }
}

module.exports = tokenErrors;