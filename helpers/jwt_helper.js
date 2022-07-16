const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');
const eventDB = require('../data/models/event');
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
    if (req.user.id.toString() === req.decodedToken.user_id.toString()) {
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
    }
}

const validateCreatorRights = async (req, res, next) => {
    try {
        const user_id = req.user.id
        const { business_ids } = await db.getUserBusinessRoles(user_id)

        if(business_ids.includes(req.body.venue_id) || business_ids.includes(req.body.brand_id)) {
            next()
        } else {
            throw new Error('invalid_role_rights')
        }
        
    } catch (error) {
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type,
        })
    }
}

// USED - /roles/approve/:request_id, /roles/reject/:id
const validateManagmentRole = async (req, res, next) => {
    try {
        const user_id = req.user.id
        const role_id = req.params.role_id

        const user_role_request = await db.findById(role_id)
        const admin_role = await db.findRole(user_id, user_role_request.business_id)

        if(admin_role.role_type === 'admin' || admin_role.role_type === 'manager'){
            next()
        } else {
            throw new Error('invalid_role_rights')
        }

    } catch (error) {
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type
        })
    }
}

const validateAdminRole = async (req, res, next) => {
    try {
        const admin_id = req.user.id
        const role_id = req.params.role_id

        const user_role_request = await db.findById(role_id)
        const admin_role = await db.findRole(admin_id, user_role_request.business_id)

        if(admin_role.role_type === 'admin'){
            next()
        } else {
            throw new Error('invalid_role_rights')
        }

    } catch (error) {
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type
        })
    }
}

const validateToken = (req, res, next) => {
    // console.log(req.headers)
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

const validateEventEditRights = async (req, res, next) => {
    try {
        const event_update = req.body
        const event_id = req.params.id
        const { venue_id, brand_id, created_by } = await eventDB.findById(event_id)
        let business_id_list = [ venue_id, brand_id ]
        
        // if user is the user who created the event access granted
        if(created_by === req.user.id) { next() }
    
        // if updating venue update business_ids
        if(event_update.venue_id !== venue_id) {
            business_id_list[0] = event_update.venue_id
        }
    
        // if updating brand update business_ids
        if(event_update.brand_id !== brand_id) {
            business_id_list[1] = event_update.brand_id
        }
    
        const editor_roles = await db.checkUserRoles(req.user.id, business_id_list)
        
        if (editor_roles.length <= 0) {
            throw new Error('roles_not_found')
        }

        const validated_index = editor_roles.findIndex(role => role.role_type === 'admin' || role.role_type === 'manager')

        if (validated_index === -1) { throw new Error('update_failed') }
        
        next()

    } catch (error) {
        next({ 
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message
        })
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
    validateCreatorRights,
    validateManagmentRole,
    validateAdminRole,
    validateEventEditRights,
    validateUserRole,
}