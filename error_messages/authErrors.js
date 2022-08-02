const authErrors = {
    duplicate_username: {
        status: 400,
        message: 'username already registered',
        type: 'username'
    },
    duplicate_email: {
        status: 400,
        message: 'email already registered',
        type: 'email'
    },
    incomplete_input: {
        status: 400,
        message: 'please fill all required inputs'
    },
    invalid_credentials: {
        status: 400,
        message: 'invalid username and or password',
        type: 'credentials'
    }
}

module.exports = authErrors;