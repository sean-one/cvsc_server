const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');
const tokenErrors = require('../error_messages/tokenErrors');

// used at users/register, users/login
const createToken = (user) => {
    const payload = {
        user_id: user.id,
        username: user.username,
        account_type: user.account_type
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
        const { request_id } = req.body
        const { business_id } = await db.findById(request_id)

        if (request_id !== req.params.id) {
            throw new Error('non_matching_request')
        }
        
        // validate that user has role of admin or manager for the selected business
        await db.userValidation(user_id, business_id)        

        req.validated = true;
        req.request_id = request_id;

        next()

    } catch (error) {

        next({ status: tokenErrors[error.message]?.status, message: tokenErrors[error.message]?.message })
    }
}

const validateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.decodedToken = decoded;
        next()
    } catch (error) {
        console.log(error.name, error.message, error.expiredAt)
        if(error.name === 'TypeError') {
            res.status(401).json({ message: 'missing token, please log in' })
        } else if(error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'invalid token, please log in' })
        } else if(error.name === 'TokenExpiredError') {
            res.status(401).json({ message: error.message })  
        } else {
            res.status(500).json({ message: 'server error' })
        }
    }
}

// validates a user when creating or making changes to an event
const validateUserRole = async (req, res, next) => {
    const { business_ids } = await db.getUserBusinessRoles(req.decodedToken.user_id)
    if (business_ids.includes(req.body.venue_id) || business_ids.includes(req.body.brand_id)) {
        // validated user roles
        next()
    } else {
        console.log('invalid admin roles')
        res.status(403).json({ type: 'role_rights', message: 'invalid role rights' });
    }
}

module.exports = {
    createToken,
    validateToken,
    validateUser,
    validateRequestRights,
    validateUserRole,
}