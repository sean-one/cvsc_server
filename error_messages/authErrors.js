const authErrors = {
    duplicate_username: {
        status: 409,
        message: 'username unavailable',
        type: 'username'
    },
    duplicate_email: {
        status: 409,
        message: 'email already registered',
        type: 'email'
    },
    invalid_username: {
        status: 422,
        message: 'invalid username format',
        type: 'username'
    },
    // passport-config
    incomplete_input: {
        status: 400,
        message: 'please fill all required inputs',
        type: 'credentials'
    },
    // passport-config
    invalid_credentials: {
        status: 400,
        message: 'invalid username and or password',
        type: 'credentials'
    }
}

module.exports = authErrors;