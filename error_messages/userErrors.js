const userErrors = {
    // .post('/register') - invalid input
    invalid_input: {
        status: 400,
        message: 'invalid input / spam detected',
        type: 'server'
    },
    // .post('USERS/update') - user not found
    invalid_user: {
        status: 404,
        message: 'invalid user / user not found',
        type: 'server'
    },
    // .post('USERS/update')
    empty_object: {
        status: 400,
        message: 'no user updates submitted',
        type: 'server'
    },
    // .post('USERS/update')
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'avatar'
    },
    // .post('USERS/send-verification-email')
    ses_failed: {
        status: 400,
        message: 'error sending verification email',
        type: 'server'
    },
    // .post('USERS/send-verification-email)
    verification_pending: {
        status: 400,
        message: 'verification email is currently pending',
        type: 'server'
    },
    // .get('USERS/verify-email')
    non_matching_email: {
        status: 400,
        message: 'failed. email does not match',
        type: 'server'
    },
    // .post('USERS/forgot-password')
    email_not_validated: {
        status: 400,
        message: 'email validation is required for password reset',
        type: 'server'
    },
    // .post('USERS/forgot-password')
    pending_reset: {
        status: 400,
        message: 'email reset already pending',
        type: 'server'
    },
    // passport-config - local strategy
    incomplete_input: {
        status: 400,
        message: 'please fill in all required fields',
        type: 'server'
    },
    // passport-config - local strategy
    invalid_credentials: {
        status: 400,
        message: 'invalid credentials server error',
        type: 'server'
    },
    delete_failed: {
        status: 500,
        message: 'user delete failed',
        type: 'server'
    },
    //
    //
    //
    //
    //
    // generic server errors
    create_user_server_error: {
        status: 400,
        message: 'server error while creating user',
        type: 'server'
    },
    user_find_id_server_error: {
        status: 400,
        message: 'server error finding user by id',
        type: 'server'
    },
    update_user_server_error: {
        status: 400,
        message: 'server error updating user',
        type: 'server'
    },
    user_find_username_server_error: {
        status: 400,
        message: 'server error finding user by username',
        type: 'server'
    },
    user_find_email_server_error: {
        status: 400,
        message: 'server error finding user by email',
        type: 'server'
    },
    user_find_reset_token_server_error: {
        status: 400,
        message: 'server error finding user by reset password token',
        type: 'server'
    },
    user_find_refresh_server_error: {
        status: 400,
        message: 'server error finding user by refresh',
        type: 'server'
    },
    user_remove_refresh_server_error: {
        status: 400,
        message: 'server error remove user refresh',
        type: 'server'
    },
}

module.exports = userErrors;