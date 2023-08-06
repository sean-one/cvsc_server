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
    try {
        const cookies = req.cookies
    
        if(!cookies.jwt) throw new Error('no_token')
    
        const user_decoded = jwt.verify(cookies.jwt, process.env.JWT_REFRESHTOKEN_SECRET, 'invalid_token')
        req.user_decoded = user_decoded.user
        
        next()
    } catch (error) {
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


// =============================================
//      ROLES VALIDATIONS
// =============================================

// confirms event creator has 'creator' or higher roles with either brand_id or venue_id
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

// =============================================
//      BUSINESS VALIDATIONS
// =============================================

// confirm user making change to business is business_admin
const businessAdmin = async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const { business_id } = req.params
        if(!user_id || !business_id) throw new Error('invalid_request')

        // get the business admin for selected business
        const { business_admin } = await businessDB.findBusinessById(business_id)
        if(!business_admin) throw new Error('invalid_request')

        // confirm request user is same as business_admin listed on business
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

// =============================================
//      EVENT VALIDATIONS
// =============================================

const eventCreator = async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const { event_id } = req.params
        if(!user_id || !event_id) throw new Error('invalid_request')

        // get the created_by user from the event
        const { created_by } = await eventDB.findById(event_id)
        if(!created_by) throw new Error('invalid_request')

        // confirm user making changes to event is the creator of the event
        if(created_by !== user_id) {
            throw new Error('invalid_user')
        }
        
        next()
    } catch (error) {
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

const eventManager = async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        const { event_updates } = req.body

        if (!user_id || !event_updates.business_id) throw new Error('invalid_request')

        const user_role = await db.findUserBusinessRole(event_updates.business_id, user_id)
        if(!user_role) throw new Error('invalid_request')

        if(user_role.role_type >= process.env.MANAGER_ACCOUNT) {
            next()
        } else {
            throw new Error('invalid_user')
        }

    } catch (error) {
        console.log(error)
        next({
            status: tokenErrors[error.message]?.status,
            type: tokenErrors[error.message]?.type,
            message: tokenErrors[error.message]?.message,
        })
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
    businessEditRole,
    checkBusinessManagement,
    eventCreator,
    eventManager,
}