const userErrors = {
    invalid_user: {
        status: 400,
        message: 'invalid user',
    },
    invalid_password_format: {
        status: 400,
        message: 'invalid password formatting',
        type: 'credentials'
    },
    invalid_email_format: {
        status: 400,
        message: 'invalid email formatting',
        type: 'email'
    },
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'avatar'
    },
    empty_object: {
        status: 400,
        message: 'no changes found',
        type: 'input'
    },
    delete_failed: {
        status: 500,
        message: 'user delete failed',
        type: 'server'
    },



    
    // generic server errors
    create_user_server_error: {
        status: 400,
        message: 'server error while creating user',
        type: 'server'
    },
}

module.exports = userErrors;