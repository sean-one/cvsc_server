const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');
const businessDB = require('../data/models/business');
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

const validToken = (req, res, next) => {
    console.log('inside validtoken')
    try {
        const cookies = req.cookies
    
        if(!cookies.jwt) throw new Error('invalid_token')
    
        const user_decoded = jwt.verify(cookies.jwt, process.env.JWT_REFRESHTOKEN_SECRET, 'invalid_token')
        req.user_decoded = user_decoded.user
        
        next()
    } catch (error) {
        console.log('error in token validation')
        // console.log(error.name)
        if(error?.name === 'TokenExpiredError') {
            next({
                status: tokenErrors[error.name]?.status,
                message: tokenErrors[error.name]?.message,
                type: tokenErrors[error.name]?.type,
            })

        } else {
            next({
                status: tokenErrors[error.message]?.status,
                message: tokenErrors[error.message]?.message,
                type: tokenErrors[error.message]?.type,
            })
        }

    }
}

// validates creator rights for either brand_id or venue_id
const validateEventCreation = async (req, res, next) => {
    try {
        const user_id = req.user_decoded

        if (!user_id) throw new Error('invalid_user')

        const { venue_id, brand_id } = req.body

        // get array of business_id's for ALL ACTIVE roles for CREATOR, MANAGER & ADMIN 
        const { business_ids } = await db.getUserBusinessRoles(user_id)

        if(business_ids.includes(venue_id) || business_ids.includes(brand_id)) {
            console.log('valid creator')
            next()
        } else {
            throw new Error('invalid_user')
        }

    } catch (error) {
        console.log('error in validcreator')
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type,
        })

    }
}

const validateRoleManagement = async (req, res, next) => {
    console.log('inside validate management')
    try {
        const user_id = req.user_decoded

        if(!user_id) throw new Error('invalid_user')

        const { role_id } = req.params

        if(!role_id) throw new Error('request_not_found')
        const { business_id, role_type} = await db.findRoleById(role_id)

        if(!business_id || !role_type) throw new Error('request_not_found')
        const manager_role = await db.findUserBusinessRole(business_id, user_id)

        if(!manager_role) throw new Error('invalid_user')

        if(manager_role.role_type > role_type) {
            next()
        } else {
            throw new Error('invalid_user')
        }
    } catch (error) {

        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type,
        })
    }
}

const roleRequestUser = async (req, res, next) => {
    console.log('inside the role request user')
    try {
        const request_user = req.user_decoded
        if(!request_user) throw new Error('invalid_user')

        const { role_id } = req.params
        if(!role_id) throw new Error('request_not_found')
        
        const { user_id } = await db.findRoleById(role_id)
        if(!user_id) throw new Error('invalid_user')

        if(user_id === request_user) {
            next()
        } else {
            throw new Error('invalid_user')
        }
    } catch (error) {

        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type,
        })
    }
}

const businessAdmin = async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const { business_id } = req.params
        if(!user_id || !business_id) throw new Error('invalid_request')

        const { business_admin } = await businessDB.findById(business_id)
        if(!business_admin) throw new Error('invalid_request')

        if(business_admin === user_id) {
            next()
        } else {
            throw new Error('invalid_user')
        }

    } catch (error) {
        console.log(error)
        next({
            status: tokenErrors[error.message]?.status,
            message: tokenErrors[error.message]?.message,
            type: tokenErrors[error.message]?.type,
        })
    }
}

const eventCreator = async (req, res, next) => {
    console.log('inside eventCreator')
    try {
        const user_id = req.user_decoded
        const { event_id } = req.params
        if(!user_id || !event_id) throw new Error('invalid_request')

        const { created_by } = await eventDB.findById(event_id)
        if(!created_by) throw new Error('invalid_request')

        if(created_by === user_id) {
            console.log('valid event creator')
            next()
        } else {
            throw new Error('invalid_user')
        }
    } catch (error) {
        console.log('error in event creator token')
        // console.log(error)
        if(error.name === 'TypeError') {
            // when findById does not find an event a typeerror is thrown
            next({
                status: tokenErrors[error.name]?.status,
                message: tokenErrors[error.name]?.message,
                type: tokenErrors[error.name]?.type,
            })
        } else {
            next({
                status: tokenErrors[error.message]?.status,
                message: tokenErrors[error.message]?.message,
                type: tokenErrors[error.message]?.type,
            })
        }
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    validToken,
    validateEventCreation,
    validateRoleManagement,
    roleRequestUser,
    businessAdmin,
    eventCreator,
}