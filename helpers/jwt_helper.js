const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');

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




const validateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.decodedToken = decoded;
        next()
    } catch (error) {
        // console.log(error.name, error.message, error.expiredAt)
        if(error.name === 'TypeError') {
            res.status(401).json({ message: 'missing token, please log in' })
        } else if(error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'invalid token, please log in' })
        } else {
            res.status(500).json({ message: 'server error' })
        }
    }
}

const validateBusinessAdminRights = async (req, res, next) => {
    const data = req.body
    const { business_ids } = await db.getBusinessAdminBusinessIds(req.decodedToken.user_id)
    const validatedRoles = {
        approved_ids: [],
        rejected_ids: [],
        toDelete_ids: []
    }

    for (const [k, v] of Object.entries(data)) {
        if (v === 'approved') {
            validatedRoles.approved_ids.push(k)
        } else if (v === 'rejected') {
            validatedRoles.rejected_ids.push(k)
        } else if (v === 'toDelete') {
            validatedRoles.toDelete_ids.push(k)
        } else {
            res.status(400).json({ message: 'invalid inputs' })
        }
    }

    const requestList = [ ...validatedRoles.approved_ids, ...validatedRoles.rejected_ids, ...validatedRoles.toDelete_ids ]
    const { business_id_request } = await db.getRequestBusinessIds(requestList)
    
    const checkValidation = business_id_request.every(business => {
        return business_ids.includes(parseInt(business))
    })

    if (checkValidation) {
        req.validatedRoles = validatedRoles
        next()
    } else {
        res.status(404).json({ message: 'invalid credentials' })
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

const validateUserAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)
        if (decoded.user_id === Number(process.env.ADMIN_ID) && decoded.username === process.env.ADMIN_NAME) {
            next()
        } else {
            //! need to add some sort of alarm if this is hit
            res.status(403).json({ message: 'invalid user'})
        }
    } catch (error) {
        // console.log(error.name, error.message, error.expiredAt)
        if (error.name === 'TypeError') {
            res.status(401).json({ message: 'missing token' })
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'invalid signature' })
        } else {
            // console.log('error')
            // console.log(error)
            res.status(500).json({ message: 'server error' })
        }
    }
}

module.exports = {
    createToken,
    validateToken,
    validateUser,
    validateBusinessAdminRights,
    validateUserRole,
    validateUserAdmin,
}