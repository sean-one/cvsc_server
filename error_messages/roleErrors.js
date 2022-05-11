const roleErrors = {
    roles_user_id_business_id_unique: {
        status: 400,
        message: 'request already pending'
    },
    missing_input: {
        status: 400,
        message: 'missing business id'
    },
    roles_business_id_foreign: {
        status: 404,
        message: 'business not found'
    },
    roles_user_id_foreign: {
        status: 404,
        message: 'user not found'
    }
}

module.exports = roleErrors;