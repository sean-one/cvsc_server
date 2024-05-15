
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
    }
}

module.exports = tokenErrors;