const { check, validationResult } = require('express-validator');
const userDB = require('../data/models/user')


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
        throw new Error('username already in use')
    }
    
    return true
};

const validateUserAvatarFile = (req, res, next) => {
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

}


const registerUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 3, max: 20 }).withMessage('username length must be between 3 and 20 charactors')
        .custom(isUsernameValid)
        .custom(isUsernameUnique)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required').escape(),
    check('email').trim().not().isEmpty().withMessage('email is required').isEmail().escape(),
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
    validateUserAvatarFile,
    result
}