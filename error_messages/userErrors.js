const userErrors = {
    incomplete_input: {
        status: 400,
        message: 'please fill all required inputs'
    },
    user_not_found: {
        status: 404,
        message: 'user not found'
    },
    invalid_credentials: {
        status: 401,
        message: 'username and password do not match'
    },
    users_username_unique: {
        status: 400,
        message: 'username is not available',
        type: 'username'
    },
    users_email_unique: {
        status: 400,
        message: 'email already registered',
        type: 'email'
    }
}

module.exports = userErrors;