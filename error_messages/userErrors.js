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
}

module.exports = userErrors;