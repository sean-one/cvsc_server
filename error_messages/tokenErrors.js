
// used in jwt_helper -> validToken
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
}

module.exports = tokenErrors;