const userErrors = {
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
    user_find_refresh_server_error: {
        status: 400,
        message: 'server error finding user by refresh',
        type: 'server'
    },
    user_remove_refresh_server_error: {
        status: 400,
        message: 'server error remove user refresh',
        type: 'server'
    }
}

module.exports = userErrors;