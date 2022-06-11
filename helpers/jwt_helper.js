const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');
const tokenErrors = require('../error_messages/tokenErrors');

// used at users/register, users/login
const createToken = (user) => {
    const payload = {
        user_id: user.id,
        username: user.username,
    }

    const secret = process.env.JWT_SECRET;
    const options = {
        expiresIn: process.env.JWT_EXPIRES
    }

    return jwt.sign(payload, secret, options);
}

// used - /roles/user/:id
const validateUser = (req, res, next) => {
    if (req.params.id.toString() === req.decodedToken.user_id.toString()) {
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
    }
}

// USED - /roles/approve/:id, /roles/reject/:id
const validateRequestRights = async (req, res, next) => {
    try {
        const { user_id } = req.decodedToken
        const request_id = req.params.id
        const { business_id } = await db.findById(request_id)

        // validate that user has role of admin or manager for the selected business
        await db.userValidation(user_id, business_id)        

        req.validated = true;
        req.request_id = request_id;

        next()

    } catch (error) {
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type
        })
    }
}

const validateToken = (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        req.decodedToken = decoded;
        
        next()
    } catch (error) {
        if(error.name === 'TypeError' || error.name === 'JsonWebTokenError') {
            next({ 
                status: tokenErrors['invalid_token']?.status,
                message: tokenErrors['invalid_token']?.message,
                type: tokenErrors['invalid_token']?.type
            })

        } else if(error.name === 'TokenExpiredError') {
            next({
                status: tokenErrors['expired_token']?.status,
                message: tokenErrors['expired_token']?.message,
                type: tokenErrors['expired_token']?.type
            })

        } else {
            next(error)

        }
    }
}

// validates a user when creating or making changes to an event
const validateUserRole = async (req, res, next) => {
    try {
        const { business_ids } = await db.getUserBusinessRoles(req.decodedToken.user_id)
        if (business_ids.includes(req.body.venue_id) || business_ids.includes(req.body.brand_id)) {
            // validated user roles
            next()
        } else {
            throw new Error('invalid_role_rights')
        }
    } catch (error) {
        next({ status: tokenErrors[error.message]?.status, message: tokenErrors[error.message]?.message })
    }
}

module.exports = {
    createToken,
    validateToken,
    validateUser,
    validateRequestRights,
    validateUserRole,
}