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

const validateCreator = async (req, res, next) => {
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
            throw new Error('invalid_user')
        }
    } catch (error) {
        
        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
        })
        
    }
}

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
            throw new Error('invalid_user')
        }
    } catch (error) {
        
        next({
            status: tokenErrors[error.name]?.status,
            message: tokenErrors[error.name]?.message,
            type: tokenErrors[error.name]?.type,
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
    validateCreator,
    validateManager,
    validateAdmin,
    businessAdmin,
    eventCreator,
}