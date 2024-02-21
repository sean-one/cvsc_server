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
}

module.exports = userErrors;