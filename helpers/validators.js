const { check, validationResult } = require('express-validator');
const userDB = require('../data/models/user');
const businessDB = require('../data/models/business');
const eventsDB = require('../data/models/event');


// CUSTOM REGEX PATTERNS
const googlePlaceIdFormat = /^[\w-]+$/;
const phonePattern = /^\d{10}$/;
const instagramPattern = /^[a-zA-Z0-9._]{1,30}$/;
const twitterPattern = /^[a-zA-Z0-9_]{1,15}$/;
const facebookPattern = /^[a-zA-Z0-9._-]{5,}$/;
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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
    if(value.length < 8) {
        return 'password is too short - must be at least 8 characters'
    }

    if(value.length >= 49) {
        return 'password is too long - must be under 50 characters'
    }
    
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

const validateImageAdmin = async (req, res, next) => {
    const exceptedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if(!req.file) { next() }

    else if(req.file && req.business_role !== process.env.ADMIN_ACCOUNT) {
        return res.status(400).json({ message: 'invalid business role rights' })
    }

    else {
        const fileExtension = req.file?.mimetype.split('/')[1];
        if(!exceptedFileTypes.includes(fileExtension)) {
            return res.status(400).json({ message: 'only .png, .jpg, .jpeg & .webp file types' })
        }
        next()
    }
}

const isBusinessNameUnique = async (value) => {
    const found = await businessDB.checkBusinessName(value)

    if(found !== undefined) {
        throw new Error('business name already in use (duplicate)')
    }

    return true
};

const isBusinessAdmin = async (value, { req }) => {
    if(req.business_role !== process.env.ADMIN_ACCOUNT && value) {
        throw new Error('invalid business role rights')
    }

    return true
}

const isEventNameUnique = async (value) => {
    const found = await eventsDB.checkEventName(value)

    if(found !== undefined) {
        throw new Error('event name already in use (duplicate)')
    }

    return true
}

function isValidDate(value) {
    // date pater should be yyyy-m-d
    const datePattern = /^\d{4}-\d{1,2}-\d{1,2}$/;
  
    // Check if the input matches the expected format "yyyy-m-d"
    if (!datePattern.test(value)) {
        throw new Error('event date format error')
    }

    // Extract year, month, and day from the input
    const [year, month, day] = value.split('-').map(Number);
  
    // Create a Date object and check if it represents a valid date
    const parsedDate = new Date(year, month - 1, day);
  

    const isValid =
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === day;

    if (!isValid) {
        throw new Error('invalid date')
    }

    // Check if the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
        throw new Error('event date can not be in the past');
    }

    // Check if the date is within the next 60 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    futureDate.setHours(0, 0, 0, 0);
    if (parsedDate > futureDate) {
        throw new Error('events may only be 60 days out')
    }

    return true
}

function isValidTime(value) {
    const timePattern = /^\d{4}$/;

    // Check if the input matches the expected format "HHmm"
    if (!timePattern.test(value)) {
        throw new Error('time format error')
    }

    // Extract hours and minutes from the input
    const hours = parseInt(value.substring(0, 2));
    const minutes = parseInt(value.substring(2));

    // Check if the extracted values represent a valid time
    if(Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return true;
    } else {
        throw new Error('invalid time')
    }
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
        .isIn(['brand','venue','both']).withMessage('invalid business type')
        .escape(),
    check('place_id').if((value, { req }) => req.body['business_type'] !== 'brand')
        .notEmpty().withMessage('business address is required')
        .matches(googlePlaceIdFormat).withMessage('invalid google place id format')
        .escape(),
    check('business_email').trim().optional().isEmail().escape(),
    check('business_phone').trim().optional()
        .matches(phonePattern).withMessage('phone number must be 10 digits')
        .escape(),
    check('business_instagram').trim().optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('instagram must be between 1 and 30 characters')
        .matches(instagramPattern).withMessage('instagram may only contain letters, numbers and underscores( _ )')
        .escape(),
    check('business_twitter').trim().optional()
        .isLength({ min: 1, max: 15 }).withMessage('twitter must be between 1 and 15 characters')
        .matches(twitterPattern).withMessage('twitter may only contain letters, numbers and underscores( _ )')
        .escape(),
    check('business_facebook').trim().optional()
        .isLength({ min: 5 }).withMessage('facebook must be at least 5 characters')
        .matches(facebookPattern).withMessage('facebook may only contain letters, numbers, underscores( _ ), hyphens( - )')
        .escape(),
    check('business_website').trim().optional().isURL(),
]

const updateBusinessValidator = [
    check('business_description').trim().optional().escape(),
    check('business_type').trim().optional()
        .custom(isBusinessAdmin)
        .isIn(['brand','venue','both']).withMessage('invalid business type')
        .escape(),
    check('place_id').trim().optional()
        .custom(isBusinessAdmin)
        .matches(googlePlaceIdFormat).withMessage('invalid google places id format')
        .escape(),
    check('business_email').trim().optional()
        .custom(isBusinessAdmin)
        .isEmail().escape(),
    check('business_phone').trim().optional()
        .matches(phonePattern).withMessage('phone number must be 10 digits')
        .escape(),
    check('business_instagram').trim().optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('instagram must be between 1 and 30 characters')
        .matches(instagramPattern).withMessage('instagram may only contain letters, numbers and underscores( _ )')
        .escape(),
    check('business_twitter').trim().optional()
        .isLength({ min: 1, max: 15 }).withMessage('twitter must be between 1 and 15 characters')
        .matches(twitterPattern).withMessage('twitter may only contain letters, numbers and underscores( _ )')
        .escape(),
    check('business_facebook').trim().optional()
        .isLength({ min: 5 }).withMessage('facebook must be at least 5 characters')
        .matches(facebookPattern).withMessage('facebook may only contain letters, numbers, underscores( _ ), hyphens( - )')
        .escape(),
    check('business_website').trim().optional().isURL(),
]

const newEventValidator = [
    check('eventname').trim().not().isEmpty().withMessage('eventname is required')
        .isLength({ min: 2, max: 50}).withMessage('event name must be at least 2 characters, and no more then 50')
        .custom(isEventNameUnique)
        .escape(),
    check('eventdate').trim().not().isEmpty().withMessage('event date is required')
        .custom(isValidDate)
        .escape(),
    check('eventstart').trim().not().isEmpty().withMessage('event start time is required')
        .custom(isValidTime)
        .escape(),
    check('eventend').trim().not().isEmpty().withMessage('event end time is required')
        .custom(isValidTime)
        .escape(),
    check('venue_id').trim().not().isEmpty().withMessage('event location is required')
        .matches(uuidPattern).withMessage('venue not found')
        .escape(),
    check('details').trim().not().isEmpty().withMessage('event details are required').escape(),
    check('brand_id').trim().not().isEmpty().withMessage('event branding is required')
        .matches(uuidPattern).withMessage('business not found')
        .escape(),
]

const updateEventValidator =[
    check('eventname').trim().optional()
        .isLength({ min: 2, max: 50}).withMessage('event name must be at least 2 characters, and no more then 50')
        .custom(isEventNameUnique)
        .escape(),
    check('eventdate').trim().optional()
        .custom(isValidDate)
        .escape(),
    check('eventstart').trim().optional()
        .custom(isValidTime)
        .escape(),
    check('eventend').trim().optional()
        .custom(isValidTime)
        .escape(),
    check('venue_id').trim().optional()
        .matches(uuidPattern).withMessage('venue not found')
        .escape(),
    check('details').trim().optional().escape(),
    check('brand_id').trim().optional()
        .matches(uuidPattern).withMessage('business not found')
        .escape(),
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
    loginUserValidator,
    newBusinessValidator,
    registerUserValidator,
    validateImageFile,
    validateImageAdmin,
    updateBusinessValidator,
    updateUserValidator,
    newEventValidator,
    updateEventValidator,
    result
}