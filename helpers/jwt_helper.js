const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');
const eventDB = require('../data/models/event');
const tokenErrors = require('../error_messages/tokenErrors');

const createAccessToken = (user_id) => {
    const payload = {
        user: user_id
    }

    const secret = process.env.JWT_ACCESSTOKEN_SECRET;
    const options = {
        expiresIn: process.env.JWT_ACCESSTOKEN_EXP
    }

    return jwt.sign(payload, secret, options);
}

const createRefreshToken = (user_id) => {
    const payload = {
        user: user_id
    }

    const secret = process.env.JWT_REFRESHTOKEN_SECRET;
    const options = {
        expiresIn: process.env.JWT_REFRESHTOKEN_EXP
    }

    return jwt.sign(payload, secret, options);
}

//! updated helper
const validToken = (req, res, next) => {
    console.log('inside validToken')
    try {
        const cookies = req.cookies
    
        if(!cookies.jwt) throw new Error('cookie_not_found')
    
        const user_decoded = jwt.verify(cookies.jwt, process.env.JWT_REFRESHTOKEN_SECRET)
        console.log('decoded')
        console.log(user_decoded)
        req.user_decoded = user_decoded.user
        
        console.log('valid token')
        next()
    } catch (error) {
       console.log(error.name)
        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
        })

    }
}

//! updated helper
const validateCreator = async (req, res, next) => {
    console.log('inside validateCreator')
    try {
        const user_id = req.user_decoded

        if (!user_id) throw new Error('invalid_user')

        const { venue_id, brand_id } = req.body

        const { business_ids } = await db.getUserBusinessRoles(user_id)

        if(business_ids.includes(venue_id) || business_ids.includes(brand_id)) {
            console.log('valid creator')
            next()
        } else {
            throw new Error('invalid_role_rights')
        }

    } catch (error) {

        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
        })

    }
}

//! updated helper
const validateManager = async (req, res, next) => {
    console.log('inside validateManager')
    try {
        const user_id = req.user_decoded

        if(!user_id) throw new Error('invalid_user')
        // console.log(`user_id: ${user_id}`)

        const { role_id } = req.params
        // console.log(`request_id: ${role_id}`)

        if(!role_id) throw new Error('request_not_found')
        const { business_id } = await db.findById(role_id)
        // console.log(`business_id: ${business_id}`)

        if(!business_id) throw new Error('request_not_found')
        const role_rights = await db.findBusinessRoleByUser(business_id, user_id)
        // console.log(`role_type: ${role_rights.role_type}`)

        if(!role_rights) throw new Error('invalid_user')

        if(role_rights.role_type >= 456) {
            next()
        } else {
            throw new Error('invalid_role_rights')
        }
    } catch (error) {
        
        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
        })
        
    }
}

//! updated helper
const validateAdmin = async (req, res, next) => {
    console.log('inside validateAdmin')
    try {
        const user_id = req.user_decoded

        if(!user_id) throw new Error('invalid_user')
        // console.log(`user_id: ${user_id}`)

        const { role_id } = req.params
        // console.log(`request_id: ${role_id}`)

        if(!role_id) throw new Error('request_not_found')
        const { business_id } = await db.findById(role_id)
        // console.log(`business_id: ${business_id}`)

        if(!business_id) throw new Error('request_not_found')
        const role_rights = await db.findBusinessRoleByUser(business_id, user_id)
        // console.log(`role_type: ${role_rights.role_type}`)

        if(!role_rights) throw new Error('invalid_user')

        if(role_rights.role_type >= 789) {
            next()
        } else {
            throw new Error('invalid_role_rights')
        }
    } catch (error) {
        
        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
        })
        
    }
}

// used - /roles/user/:id
const validateUser = (req, res, next) => {
    if (req.user.id.toString() === req.decodedToken.user_id.toString()) {
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
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

const validateEventEditRights = async (req, res, next) => {
    console.log(req.body)
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
        
        if (validated_index === -1) { throw new Error('invalid_role_rights') }
        
        next()

    } catch (error) {
        next({ 
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type
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
    validToken,
    validateCreator,
    validateManager,
    validateAdmin,
    createAccessToken,
    createRefreshToken,
    validateUser,
    validateAdminRole,
    validateEventEditRights,
    validateUserRole,
}