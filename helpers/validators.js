const { check, validationResult } = require('express-validator');

const registerUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required'),
    check('password').trim().not().isEmpty().withMessage('password is required'),
    check('email').trim().not().isEmpty().withMessage('email is required')
]

const result = (req, res, next) => {
    const result = validationResult(req);
    const hasError = !result.isEmpty();

    if(hasError) {
        const error = result.array()[0]
        return res.status(400).json({ message: error.msg })
    }

    next()
}

module.exports = {
    registerUserValidator,
    result
}