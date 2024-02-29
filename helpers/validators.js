const { check, validationResult, oneOf } = require('express-validator');
const userDB = require('../data/models/user');
const businessDB = require('../data/models/business');
const eventsDB = require('../data/models/event');
const rolesDB = require('../data/models/roles');

// CUSTOM REGEX PATTERNS
const googlePlaceIdFormat = /^[A-Za-z0-9_\-+\.]{20,}$/;
const phonePattern = /^\d{10}$/;
const instagramPattern = /^[a-zA-Z0-9._]{1,30}$/;
const twitterPattern = /^[a-zA-Z0-9_]{1,15}$/;
const facebookPattern = /^[a-zA-Z0-9._-]{5,}$/;
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

//! CUSTOM VALIDATIONS
//! ==================
// loginUserValidator, registerUserValidator
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

// registerUserValidator
const isUsernameUnique = async (value) => {
    const found = await userDB.checkUsernameDuplicate(value)

    if(found !== undefined) {
        throw new Error('username already in use (duplicate)')
    }
    
    return true
};

// loginUserValidator, registerUserValidator
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

// newBusinessValidator
const isBusinessNameUnique = async (value) => {
    const isDuplicate = await businessDB.checkBusinessNameDuplicate(value)
    
    if (isDuplicate) {
        throw new Error('Business name must be unique')
    }
    
    return true
};

// updateBusinessValidator
const isBusinessAdmin = async (value, { req }) => {
    const { business_id } = req.params;
    const user_id = req.user_decoded;
    
    const isAdminRole = await rolesDB.validateBusinessAdmin(business_id, user_id)

    if (!isAdminRole) {
        throw new Error('invalid permissions to make attempted changes')
    }
    return true
}

// newEventValidator
const isEventNameUnique = async (value) => {
    const found = await eventsDB.checkEventName(value)
    
    if(found !== undefined) {
        throw new Error('that event name is already being used')
    }
    
    return true
}

// newEventValidator
function isValidDate(value) {
    // date pater should be yyyy-m-d
    const datePattern = /^\d{4}-\d{1,2}-\d{1,2}$/;
    
    // Check if the input matches the expected format "yyyy-m-d"
    if (!datePattern.test(value)) {
        throw new Error('an event date formatting error has occured')
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
        throw new Error('event date is invalid')
    }
    
    // Check if the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
        throw new Error('events must not be in the past');
    }
    
    // Check if the date is within the next 60 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    futureDate.setHours(0, 0, 0, 0);
    if (parsedDate > futureDate) {
        throw new Error('events must take place within the next 60 days')
    }
    
    return true
}

// newEventValidator
function isValidTime(value) {
    const timePattern = /^\d{4}$/;
    
    // Check if the input matches the expected format "HHmm"
    if (!timePattern.test(value)) {
        throw new Error('an event time formatting error has occured')
    }
    
    // Extract hours and minutes from the input
    const hours = parseInt(value.substring(0, 2));
    const minutes = parseInt(value.substring(2));
    
    // Check if the extracted values represent a valid time
    if(Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return true;
    } else {
        throw new Error('submitted time format error')
    }
}


//! MIDDLEWARE VALIDATIONS
//! ======================
// check that at least one is present (business_id, user_id, event_id, role_id or manager_id)
const existenceChecks = oneOf([
    check('business_id').exists(),
    check('user_id').exists(),
    check('event_id').exists(),
    check('role_id').exists(),
    check('manager_id').exists(),
], 'invalid and/or missing identifier in request');

// check format IF EXISTS for business_id, user_id, event_id and role_id - 
const formatValidations = [
    check('business_id').if(check('business_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('business identifier is incorrectly formatted'),
    check('user_id').if(check('user_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('user identifier is incorrectly formatted'),
    check('event_id').if(check('event_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('event identifier is incorrectly formatted'),
    check('role_id').if(check('role_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('role identifier is incorrectly formatted'),
    check('manager_id').if(check('manager_id').exists()).trim()
        .matches(uuidPattern)
        .withMessage('manager identifier is incorrectly formatted'),
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
    } else {
        next();
    }
}

// .post('USERS/update'), .post('/register'), .post('EVENTS/')
const validateImageFile = async (req, res, next) => {
    const exceptedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if(!req.file) {

        next()
    } else {
        const fileExtension = req.file?.mimetype.split('/')[1];
        if(!exceptedFileTypes.includes(fileExtension)) {
            next({
                status: 400,
                message: 'file types must be .png, .jpg, .jpeg & .webp',
                type: 'media_error'
            })
        }

        next()
    }

};

// .put('BUSINESSES/:business_id/status/toggle)
const validateBusinessAdmin = async (req, res, next) => {
    const user_id = req.user_decoded
    const { business_id } = req.params

    const currentBusiness = await businessDB.getBusinessById(business_id)
    if(currentBusiness === undefined) {
        next({
            status: 404,
            message: 'unable to locate business by identifier',
            type: 'server'
        })
    } else {
        if(currentBusiness.business_admin !== user_id) {
            next({
                status: 403,
                message: 'must have business admin role',
                type: 'server',
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
    
    // validate the business_request_open is true
    const isAcceptingRequest = await businessDB.validateBusinessRequestOpen(business_id)

    if (!isAcceptingRequest) {
        next({
            status: 400,
            message: 'business request is closed or not found',
            type: 'server'
        })
    }
    
    // confirm non duplicate
    const hasDuplicate = await rolesDB.checkForDuplicate(business_id, user_id)
    if(hasDuplicate) {
        next({
            status: 400,
            message: 'duplicate business request are not allowed',
            type: 'server'
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
            message: 'unable to find role by identifier',
            type: 'server'
        })
    }

    // if role.user_id is user_decoded role belongs to user
    if(user_id === role_user_id) {
        next()
    } else {
        const requestUserRole = await rolesDB.getUserBusinessRole(business_id, user_id)
        
        if (requestUserRole !== undefined && role_role_type < requestUserRole.role_type) {
            
            next()
        } else {
            
            return next({
                status: 400,
                message: 'invalid role permissions to update role',
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
            message: 'invalid or unknown requested action type',
            type: 'server'
        });
    }

    // validate pending role exist throw error if role is not found
    const { business_id } = await rolesDB.getRoleById(role_id)
    if (!business_id) {
        return next({
            status: 404,
            message: 'unable to find role by identifier',
            type: 'server'
        })
    }
    // if role is valid and business_id exist check active_business
    const { active_business } = await businessDB.getBusinessById(business_id)
    if (active_business === undefined || !active_business) {
        return next({
            status: 400,
            message: 'business currently not accepting new role request',
            type: 'server'
        })
    }
    
    // validate role management
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
            status: 400,
            message: 'invalid business role permissions for that action',
            type: 'server'
        })
    }
}

// .put('BUSINESSES/:business_id'), .get('ROLES/businesses/:business_id')
const validateBusinessManagement = async (req, res, next) => {
    const user_id = req.user_decoded
    const { business_id } = req.params
    
    const isBusinessManager = await rolesDB.validateBusinessManagement(business_id, user_id)

    if (!isBusinessManager) {
        return next({
            status: 403,
            message: 'valid business permission role not found',
            type: 'server'
        })
    } else {
        next()
    }
}

// .put('EVENTS/businesses/:business_id/events/:events_id')
const validateEventBusinessRemove = async (req, res, next) => {
    const user_id = req.user_decoded;
    const { business_id, event_id } = req.params;

    const isEventCreator = await eventsDB.validateCreatedBy(event_id, user_id)

    if (isEventCreator) {
        next()
    } else {
        const businessRole = await rolesDB.getUserBusinessRole(business_id, user_id)
    
        if (businessRole === undefined || businessRole.active_role === false || businessRole.role_type < process.env.MANAGER_ACCOUNT) {
            return next({
                status: 400,
                message: 'business remove failed - invalid business role',
                type: 'server'
            })
        } else {
            next()
        }
    }

}

// .delete('EVENTS/:event_id') - validate that user created an event
const validateEventCreator = async (req, res, next) => {
    const user_id = req.user_decoded
    const { event_id } = req.params

    const isEventCreator = await eventsDB.validateCreatedBy(event_id, user_id)
    if(isEventCreator) {
        next()
    } else {
        next({
            status: 400,
            message: 'only event creator can delete an upcoming event',
            type: 'server'
        })
    }
}

// .post('EVENTS/'), .put('EVENTS/:event_id') - validate user roles for at least one event business
const validateEventBusinessRoles = async (req, res, next) => {
    const user_id = req.user_decoded;
    const business_id = req.body.host_business;

    const hasActiveRole = await rolesDB.checkForRole(user_id, business_id)

    if (hasActiveRole) {
        next()
    } else {
        next({
            status: 400,
            message: 'must have at least creator permission for business',
            type: 'server'
        })
    }
}

// .post('/register')
const registerUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 4, max: 50 }).withMessage('invalid username format')
        .custom(isUsernameValid)
        .custom(isUsernameUnique)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50}).withMessage('invalid password format')
        .custom(validatePassword)
        .escape(),
    check('email').trim().not().isEmpty().withMessage('email is required')
        .isEmail().normalizeEmail().withMessage('invalid email format')
        .escape(),
]

// .post('/login')
const loginUserValidator = [
    check('username').trim().not().isEmpty().withMessage('username is required')
        .isLength({ min: 4, max: 50 }).withMessage('invalid username format')
        .custom(isUsernameValid)
        .escape(),
    check('password').trim().not().isEmpty().withMessage('password is required')
        .isLength({ min: 8, max: 50 }).withMessage('invalid password format')
        .custom(validatePassword)
        .escape(),
]

// .post('USERS/update')
const updateUserValidator = [
    check('username').trim().optional()
        .isLength({ min: 4, max: 50 }).withMessage('invalid username length')
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

// .post('BUSINESSES/')
const newBusinessValidator = [
    check('business_name').trim().not().isEmpty().withMessage('business name is required')
        .isLength({ min: 4, max: 50 }).withMessage('business name must be between 4 and 50 characters')
        .custom(isBusinessNameUnique)
        .escape(),
    check('business_description').trim().not().isEmpty().withMessage('business description is required')
        .escape(),
    check('place_id').trim().optional()
        .matches(googlePlaceIdFormat).withMessage('invalid google place id format')
        .escape(),
    check('business_email').trim().optional().isEmail().normalizeEmail().escape(),
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
    check('business_website').trim().optional().isURL()
        .escape(),
]

// put('BUSINESSES/:business_id)
const updateBusinessValidator = [
    check('business_description').trim().optional()
        .escape(),
    check('place_id').trim().optional()
        .custom(isBusinessAdmin)
        .matches(googlePlaceIdFormat).withMessage('invalid google places id format')
        .escape(),
    check('business_email').trim().optional()
        .custom(isBusinessAdmin)
        .isEmail().normalizeEmail()
        .escape(),
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
    check('business_website').trim().optional().isURL()
        .escape(),
]

// .post('EVENTS/')
const newEventValidator = [
    check('eventname').trim().not().isEmpty().withMessage('an eventname is required')
        .isLength({ min: 4, max: 50}).withMessage('an event name must be between 4 and 50 characters')
        .custom(isEventNameUnique)
        .escape(),
    check('place_id').trim().not().isEmpty().withMessage('an event location is required')
        .matches(googlePlaceIdFormat).withMessage('invalid google place id format')
        .escape(),
    check('eventdate').trim().not().isEmpty().withMessage('an event date is required')
        .custom(isValidDate)
        .escape(),
    check('eventstart').trim().not().isEmpty().withMessage('an event starting time is required')
        .custom(isValidTime)
        .escape(),
    check('eventend').trim().not().isEmpty().withMessage('an event ending time is required')
        .custom(isValidTime)
        .escape(),
    check('host_business').trim().not().isEmpty().withMessage('an event must have a business')
        .matches(uuidPattern).withMessage('invalid business identifier')
        .escape(),
    check('details').trim().not().isEmpty().withMessage('event details are required')
        .escape(),
]

// .put('EVENTS/:event_id)
const updateEventValidator =[
    check('eventname').trim().optional()
        .isLength({ min: 4, max: 50 }).withMessage('an event name must be between 4 and 50 characters')
        .custom(isEventNameUnique)
        .escape(),
    check('place_id').trim().optional()
        .matches(googlePlaceIdFormat).withMessage('invalid google place id format')
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
    check('host_business').trim().optional()
        .matches(uuidPattern).withMessage('invalid business identifier')
        .escape(),
    check('details').trim().optional()
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
    validateBusinessAdmin,
    validateRoleRequest,
    validateRoleDelete,
    validateRoleAction,
    validateBusinessManagement,
    validateEventBusinessRemove,
    validateEventCreator,
    validateEventBusinessRoles,
    updateBusinessValidator,
    updateUserValidator,
    newEventValidator,
    updateEventValidator,
    result
}