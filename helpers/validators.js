const { check, validationResult, oneOf } = require('express-validator');
const userDB = require('../data/models/user');
const businessDB = require('../data/models/business');
const eventsDB = require('../data/models/event');
const rolesDB = require('../data/models/roles');

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

const isBusinessNameUnique = async (value) => {
    const found = await businessDB.checkBusinessName(value)
    
    if(found !== undefined) {
        throw new Error('Business name must be unique')
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


//! MIDDLEWARE VALIDATIONS
//! ======================
// check that at least one is present (business_id, user_id, event_id or role_id)
const existenceChecks = oneOf([
    check('business_id').exists(),
    check('user_id').exists(),
    check('event_id').exists(),
    check('role_id').exists(),
], 'invalid / missing id in request');

// check format IF EXISTS for business_id, user_id, event_id and role_id - 
const formatValidations = [
    check('business_id').if(check('business_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('invalid business format error'),
    check('user_id').if(check('user_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('invalid user format error'),
    check('event_id').if(check('event_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('invalid event format error'),
    check('role_id').if(check('role_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('invalid role format error'),
];

// validates that at least one of business_id, user_id, event_id or role_id is present and all present are formated as uuid
const uuidValidation = [
    existenceChecks,
    ...formatValidations
];

// check for any errors in uuid formating and throws an error before more validations
// if no validation is needed after uuidValidation - result can be used instead
const formatValidationCheck = async(req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        const error = errors.array()[0];

        return next({
            status: 400,
            message: error.msg,
            type: error.path
        })
    }

    next();
}

const validateImageFile = async (req, res, next) => {
    const exceptedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if(!req.file) {

        next()
    } else {
        const fileExtension = req.file?.mimetype.split('/')[1];
        if(!exceptedFileTypes.includes(fileExtension)) {
            next({
                status: 400,
                message: 'only .png, .jpg, .jpeg & .webp file types',
                type: 'media_error'
            })
        }

        next()
    }

};

const validateImageAdmin = async (req, res, next) => {
    const exceptedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if(!req.file) { next() }

    else if(req.file && req.business_role !== process.env.ADMIN_ACCOUNT) {
        next({
            status: 403,
            message: 'invalid business role rights',
            type: 'credentials'
        })
    }

    else {
        const fileExtension = req.file?.mimetype.split('/')[1];
        if(!exceptedFileTypes.includes(fileExtension)) {
            next({
                status: 400,
                message: 'only .png, .jpg, .jpeg & .webp file types',
                type: 'credentials'
            })
        }
        next()
    }
}

const validateBusinessAdmin = async (req, res, next) => {
    const user_id = req.user_decoded
    const { business_id } = req.params

    // validate that user_id is a uuid
    if(!uuidPattern.test(user_id)){
        next({
            status: 400,
            message: 'invalid user',
            type: 'credentials'
        })
    }

    // validate that business_id is a uuid
    if(!uuidPattern.test(business_id)) {
        next({
            status: 400,
            message: 'invalid business identifier',
            type: 'credentials'
        })
    }

    const currentBusiness = await businessDB.findBusinessById(business_id)
    if(currentBusiness === undefined) {
        next({
            status: 404,
            message: 'business not found',
            type: 'credentials'
        })
    } else {
        if(currentBusiness.business_admin !== user_id) {
            next({
                status: 403,
                message: 'invalid role rights',
                type: 'credentials',
            })
        } else {
            next()
        }
    }
}

// .post('ROLES/businesses/:business_id/role-request')
const validateRoleRequest = async (req, res, next) => {
    const { business_id } = req.params
    const user_id = req.user_decoded
    
    // validate that business_id is actual business
    const requestedBusiness = await businessDB.findBusinessById(business_id)
    if(!requestedBusiness) {
        next({
            status: 404,
            message: 'business not found',
            type: 'credentials'
        })
    }
    
    // validate the business_request_open is true
    if(!requestedBusiness.business_request_open) {
        next({
            status: 403,
            message: 'business request closed',
            type: 'credentials'
        })
    }
    
    // confirm non duplicate
    const hasDuplicate = await rolesDB.checkForRole(business_id, user_id)
    if(hasDuplicate) {
        next({
            status: 400,
            message: 'duplicate request not allowed',
            type: 'credentials'
        })
    }

    next()
}

// .delete('ROLES/:role_id)
const validateRoleDelete = async (req, res, next) => {
    const user_id = req.user_decoded
    const { role_id } = req.params

    // validate pending role exist throw error if role is not found
    const { user_id: role_user_id, business_id, role_type: role_role_type } = await rolesDB.getRoleById(role_id)
    if (!role_user_id) {
        return next({
            status: 404,
            message: 'role not found',
            type: 'server'
        })
    }

    // if role.user_id is user_decoded role belongs to user
    if(user_id === role_user_id) {
        next()
    } else {
        const requestUserRole = await rolesDB.getUserBusinessRole(business_id, user_id)
        console.log(requestUserRole)
        if (requestUserRole !== undefined && role_role_type < requestUserRole.role_type) {
            next()
        } else {
            return next({
                status: 403,
                message: 'invalid role permissions',
                type: 'server'
            })
        }
    }   
}

// .put('ROLES/:role_id/actions)
const validateRoleAction = async (req, res, next) => {
    const { action_type } = req.body
    const user_id = req.user_decoded
    const { role_id } = req.params

    const validActionTypes = ['approve', 'upgrade', 'downgrade']
    if (!validActionTypes.includes(action_type)) {
        return next({
            status: 400,
            message: 'invalid action type',
            type: 'server'
        });
    }

    // validate pending role exist throw error if role is not found
    const { business_id } = await rolesDB.getRoleById(role_id)
    if (!business_id) {
        return next({
            status: 404,
            message: 'role not found',
            type: 'server'
        })
    }
    
    const isBusinessAdmin = await rolesDB.validateBusinessAdmin(business_id, user_id)
    const isBusinessManager = await rolesDB.validateBusinessManagement(business_id, user_id)

    if (action_type === 'downgrade' && isBusinessAdmin) {
        next()
    }
    
    else if ((action_type === 'upgrade' || action_type === 'approve') && isBusinessManager) {
        next()
    }

    else {
        return next({
            status: 403,
            message: 'invalid business permissions',
            type: 'server'
        })
    }
}

// .put('BUSINESSES/:business_id'), .get('ROLES/businesses/:business_id'), .put('EVENTS/businesses/:business_id/events/:events_id')
const validateBusinessManagement = async (req, res, next) => {
    const user_id = req.user_decoded
    const { business_id } = req.params
    
    const businessRole = await rolesDB.getUserBusinessRole(business_id, user_id)

    if(businessRole === undefined) {
        return next({
            status: 404,
            message: 'business role not found',
            type: 'server'
        })
    } else {
        if ((businessRole.active_role === false) || (businessRole.role_type < process.env.MANAGER_ACCOUNT)) {
            return next({
                status: 403,
                message: 'invalid role rights',
                type: 'credentials'
            })
        } else {
            req.business_role = businessRole.role_type
            next()
        }
    }
}

// .delete('EVENTS/:event_id')
const validateEventCreator = async (req, res, next) => {
    const user_id = req.user_decoded
    const { event_id } = req.params

    const isEventCreator = await eventsDB.validateCreatedBy(event_id, user_id)
    if(isEventCreator) {
        next()
    } else {
        next({
            status: 403,
            message: 'invalid event permission',
            type: 'server'
        })
    }
}

const validateEventCreation = async (req, res, next) => {
    const user_id = req.user_decoded
    const { venue_id, brand_id } = req.body

    if(!uuidPattern.test(user_id)) {
        next({
            status: 400,
            message: 'invalid user',
            type: 'server'
        })
    }

    if(!uuidPattern.test(venue_id)) {
        next({
            status: 400,
            message: 'invalid business venue',
            type: 'venue_id'
        })
    }

    if(!uuidPattern.test(brand_id)) {
        next({
            status: 400,
            message: 'invalid business brand',
            type: 'brand_id'
        })
    }

    const businessIDs = await rolesDB.getUserBusinessRoles(user_id)
    if(businessIDs === undefined) {
        next({
            status: 404,
            message: 'user roles not found',
            type: 'role_rights'
        })
    }

    if(businessIDs?.business_ids.includes(venue_id) || businessIDs?.business_ids.includes(brand_id)) {
        next()
    } else {
        next({
            status: 403,
            message: 'invalid user permission',
            type: 'server'
        })
    }
}

const validateEventUpdate = async (req, res, next) => {
    const user_id = req.user_decoded
    const { event_id } = req.params

    if(!uuidPattern.test(user_id)) {
        next({
            status: 400,
            message: 'invalid user',
            type: 'server'
        })
    }

    if(!uuidPattern.test(event_id)) {
        next({
            status: 400,
            message: 'invalid event',
            type: 'server'
        })
    }

    const { venue_id: current_venue, brand_id: current_brand } = await eventsDB.getEventById(event_id)
    const { venue_id = current_venue, brand_id = current_brand } = req.body

    if(!uuidPattern.test(venue_id)) {
        next({
            status: 400,
            message: 'invalid venue',
            type: 'venue_id'
        })
    }

    if(!uuidPattern.test(brand_id)) {
        next({
            status: 400,
            message: 'invalid business brand',
            type: 'brand_id'
        })
    }

    const businessIDs = await rolesDB.getUserBusinessRoles(user_id)
    if(businessIDs === undefined) {
        next({
            status: 404,
            message: 'no roles found',
            type: 'server'
        })
    }

    if(businessIDs?.business_ids.includes(venue_id) || businessIDs?.business_ids.includes(brand_id)) {
        next()
    } else {
        next({
            status: 403,
            message: 'invalid role permission',
            type: 'server'
        })
    }
}



const registerUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 3, max: 50 }).withMessage('invalid username length')
        .custom(isUsernameValid)
        .custom(isUsernameUnique)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50}).withMessage('invalid password length')
        .custom(validatePassword)
        .escape(),
    check('email').trim().not().isEmpty().withMessage('email is required')
        .isEmail().normalizeEmail().withMessage('invalid email format')
        .escape(),
]

const loginUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 3, max: 50 }).withMessage('invalid username length')
        .custom(isUsernameValid)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50 }).withMessage('invalid password length')
        .custom(validatePassword)
        .escape(),
]

const updateUserValidator = [
    check('username').trim().optional()
        .isLength({ min: 3, max: 50 }).withMessage('invalid username length')
        .custom(isUsernameValid)
        .custom(isUsernameUnique)
        .escape(),
    check('password').trim().optional()
        .isLength({ min: 8, max: 50 }).withMessage('password length may only be between 8 and 50 characters')
        .custom(validatePassword)
        .escape(),
    check('email').trim().optional()
        .isEmail().normalizeEmail().withMessage('invalid email format')
        .escape(),
]

const newBusinessValidator = [
    check('business_name').trim().not().isEmpty().withMessage('business name is required')
        .isLength({ min: 4, max: 25 }).withMessage('business name must be between 4 and 25 characters')
        .custom(isBusinessNameUnique),
    check('business_description').trim().not().isEmpty().withMessage('business description is required'),
    check('business_type').trim().not().isEmpty().withMessage('business type required')
        .isIn(['brand','venue','both']).withMessage('invalid business type'),
    check('place_id').if((value, { req }) => req.body['business_type'] !== 'brand')
        .notEmpty().withMessage('business address is required')
        .matches(googlePlaceIdFormat).withMessage('invalid google place id format')
        .escape(),
    check('business_email').trim().optional().isEmail().normalizeEmail().escape(),
    check('business_phone').trim().optional()
        .matches(phonePattern).withMessage('phone number must be 10 digits'),
    check('business_instagram').trim().optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('instagram must be between 1 and 30 characters')
        .matches(instagramPattern).withMessage('instagram may only contain letters, numbers and underscores( _ )'),
    check('business_twitter').trim().optional()
        .isLength({ min: 1, max: 15 }).withMessage('twitter must be between 1 and 15 characters')
        .matches(twitterPattern).withMessage('twitter may only contain letters, numbers and underscores( _ )'),
    check('business_facebook').trim().optional()
        .isLength({ min: 5 }).withMessage('facebook must be at least 5 characters')
        .matches(facebookPattern).withMessage('facebook may only contain letters, numbers, underscores( _ ), hyphens( - )'),
    check('business_website').trim().optional().isURL(),
]

const updateBusinessValidator = [
    check('business_description').trim().optional(),
    check('business_type').trim().optional()
        .custom(isBusinessAdmin)
        .isIn(['brand','venue','both']).withMessage('invalid business type'),
    check('place_id').trim().optional()
        .custom(isBusinessAdmin)
        .matches(googlePlaceIdFormat).withMessage('invalid google places id format')
        .escape(),
    check('business_email').trim().optional()
        .custom(isBusinessAdmin)
        .isEmail().normalizeEmail(),
    check('business_phone').trim().optional()
        .matches(phonePattern).withMessage('phone number must be 10 digits'),
    check('business_instagram').trim().optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('instagram must be between 1 and 30 characters')
        .matches(instagramPattern).withMessage('instagram may only contain letters, numbers and underscores( _ )'),
    check('business_twitter').trim().optional()
        .isLength({ min: 1, max: 15 }).withMessage('twitter must be between 1 and 15 characters')
        .matches(twitterPattern).withMessage('twitter may only contain letters, numbers and underscores( _ )'),
    check('business_facebook').trim().optional()
        .isLength({ min: 5 }).withMessage('facebook must be at least 5 characters')
        .matches(facebookPattern).withMessage('facebook may only contain letters, numbers, underscores( _ ), hyphens( - )'),
    check('business_website').trim().optional().isURL(),
]

const newEventValidator = [
    check('eventname').trim().not().isEmpty().withMessage('eventname is required')
        .isLength({ min: 4, max: 50}).withMessage('event name at least 4 characters, no more then 50')
        .custom(isEventNameUnique),
    check('eventdate').trim().not().isEmpty().withMessage('event date is required')
        .custom(isValidDate),
    check('eventstart').trim().not().isEmpty().withMessage('event start time is required')
        .custom(isValidTime),
    check('eventend').trim().not().isEmpty().withMessage('event end time is required')
        .custom(isValidTime),
    check('venue_id').trim().not().isEmpty().withMessage('event location is required')
        .matches(uuidPattern).withMessage('venue not found'),
    check('details').trim().not().isEmpty().withMessage('event details are required'),
    check('brand_id').trim().not().isEmpty().withMessage('event branding is required')
        .matches(uuidPattern).withMessage('business not found'),
]

const updateEventValidator =[
    check('eventname').trim().optional()
        .isLength({ min: 2, max: 50}).withMessage('event name must be at least 2 characters, and no more then 50')
        .custom(isEventNameUnique),
    check('eventdate').trim().optional()
        .custom(isValidDate),
    check('eventstart').trim().optional()
        .custom(isValidTime),
    check('eventend').trim().optional()
        .custom(isValidTime),
    check('venue_id').trim().optional()
        .matches(uuidPattern).withMessage('venue not found'),
    check('details').trim().optional(),
    check('brand_id').trim().optional()
        .matches(uuidPattern).withMessage('business not found'),
]

const result = (req, res, next) => {
    console.log('hit the result middleware')
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    
    if(hasError) {
        const error = result.array()[0]
        next({
            status: 400,
            message: error.msg,
            type: error.path
        })
    } else {
        next()
    }

}

module.exports = {
    loginUserValidator,
    newBusinessValidator,
    uuidValidation,
    registerUserValidator,
    formatValidationCheck,
    validateImageFile,
    validateImageAdmin,
    validateBusinessAdmin,
    validateRoleRequest,
    validateRoleDelete,
    validateRoleAction,
    validateBusinessManagement,
    validateEventCreator,
    validateEventCreation,
    validateEventUpdate,
    updateBusinessValidator,
    updateUserValidator,
    newEventValidator,
    updateEventValidator,
    result
}