
// used in jwt_helper -> validToken
const tokenErrors = {
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
}

module.exports = tokenErrors;