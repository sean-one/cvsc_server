const { check, validationResult } = require('express-validator');
const userDB = require('../data/models/user');
const businessDB = require('../data/models/business');

// CUSTOM VALIDATIONS
const isUsernameValid = (value) => {
    if (!/^[a-zA-Z0-9*_\-.$!@]+$/.test(value)) {
        throw new Error('Username can only contain letters, numbers, *, _, -, ., $, !, @');
    }

    const specialChars = '*_-.$!@';

    for (let i = 0; i < specialChars.length - 1; i++) {
        const char = specialChars[i];
        const nextChar = specialChars[i + 1];

        const pattern = `\\${char}{2,}|\\${nextChar}{2,}`;
        const regex = new RegExp(pattern, 'g');

        if (regex.test(value)) {
            throw new Error('Username should not have repeated consecutive special characters');
        }
    }

    return true;
};

const isUsernameUnique = async (value) => {
    const found = await userDB.checkUsernameDuplicate(value)

    if(found !== undefined) {
        throw new Error('username already in use (duplicate)')
    }
    
    return true
};

const validatePassword = (value) => {
    if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+-=,./?;:'"[\]{}|\\]).{8,}$/.test(value)) {
        throw new Error('password must contain at least one uppercase letter, lowercase letter & number with (optional) special character')
    }

    return true
};

const validateImageFile = async (req, res, next) => {
    const exceptedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if(!req.file) {

        next()
    } else {
        const fileExtension = req.file?.mimetype.split('/')[1];
        if(!exceptedFileTypes.includes(fileExtension)) {
            return res.status(400).json({ message: 'only .png, .jpg, .jpeg & .webp file types' })
        }

        next()
    }

};

const isBusinessNameUnique = async (value) => {
    const found = await businessDB.checkBusinessName(value)

    if(found !== undefined) {
        throw new Error('business name already in use (duplicate)')
    }

    return true
}


const registerUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 3, max: 20 }).withMessage('username length must be between 3 and 20 characters')
        .custom(isUsernameValid)
        .custom(isUsernameUnique)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50}).withMessage('password length may only be between 8 and 50 characters')
        .custom(validatePassword)
        .escape(),
    check('email').trim().not().isEmpty().withMessage('email is required')
        .isEmail().withMessage('invalid email format')
        .escape(),
]

const loginUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 3, max: 20 }).withMessage('username length must be between 3 and 20 characters')
        .custom(isUsernameValid)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50 }).withMessage('password length may only be between 8 and 50 characters')
        .custom(validatePassword)
        .escape(),
]

const updateUserValidator = [
    check('password').trim().optional()
        .isLength({ min: 8, max: 50 }).withMessage('password length may only be between 8 and 50 characters')
        .custom(validatePassword)
        .escape(),
    check('email').trim().optional()
        .isEmail().withMessage('invalid email format')
        .escape(),
]

const newBusinessValidator = [
    check('business_name').trim().not().isEmpty().withMessage('business name is required')
        .isLength({ min: 4, max: 25 }).withMessage('business name must be between 4 and 25 characters')
        .custom(isBusinessNameUnique)
        .escape(),
    check('business_description').trim().not().isEmpty().withMessage('business description is required').escape(),
    check('business_type').trim().not().isEmpty().withMessage('business type required')
        .isIn(['brand','venue','both']).withMessage('invalid business type').escape(),
    check('address').if((value, { req }) => req.body['business_type'] !== 'brand')
        .notEmpty().withMessage('business address is required').escape(),
    check('business_email').trim().optional().isEmail().escape(),
    check('business_phone').trim().optional()
        .matches(/^\d{10}$/).withMessage('phone number must be 10 digits').escape(),
    check('business_instagram').trim().optional().escape(),
    check('business_twitter').trim().optional().escape(),
    check('business_facebook').trim().optional().escape(),
    check('business_website').trim().optional().isURL(),
]

const result = (req, res, next) => {
    const result = validationResult(req);
    const hasError = !result.isEmpty();

    if(hasError) {
        const error = result.array()[0]
        next({
            status: 400,
            message: error.msg,
            type: error.path
        })
    }

    next()
}

module.exports = {
    newBusinessValidator,
    registerUserValidator,
    validateImageFile,
    loginUserValidator,
    updateUserValidator,
    result
}