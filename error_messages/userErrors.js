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
    }
}

module.exports = userErrors;