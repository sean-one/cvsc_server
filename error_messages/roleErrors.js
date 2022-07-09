const roleErrors = {
    roles_user_id_business_id_unique: {
        status: 400,
        message: 'request already pending',
        type: 'duplicate'
    },
    missing_input: {
        status: 400,
        message: 'missing business id',
        type: 'missing_input'
    },
    roles_business_id_foreign: {
        status: 404,
        message: 'business not found'
    },
    roles_user_id_foreign: {
        status: 404,
        message: 'user not found'
    },
    delete_error: {
        status: 400,
        message: 'bad request error'
    }
}

module.exports = roleErrors;