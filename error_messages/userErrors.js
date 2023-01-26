const userErrors = {
    invalid_user: {
        status: 400,
        message: 'invalid user',
    },
    upload_error: {
        status: 400,
        message: 'image upload error',
        type: 'avatar'
    },
    empty_object: {
        status: 400,
        message: 'no changes found',
    },
}

module.exports = userErrors;