const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');

const createToken = (user) => {
    const payload = {
        subject: user.id,
        name: user.username,
        roles: user.business_roles
    }

    const secret = process.env.JWT_SECRET;
    const options = {
        expiresIn: process.env.JWT_EXPIRES
    }

    return jwt.sign(payload, secret, options);
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
            res.status(401).json({ message: 'missing token' })
        } else if(error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'invalid signature' })
        } else {
            // console.log('error')
            // console.log(error)
            res.status(500).json({ message: 'server error' })
        }
    }
}

const validateUser = (req, res, next) => {
    if (req.params.id.toString() === req.decodedToken.subject.toString()) {
        // console.log(`${req.params.id.toString()}, ${req.decodedToken.subject.toString()}`)
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
    }
}

// used at /roles/delete-roles
const validateBusinessAdmin = async (req, res, next) => {
    const { business_ids } = await db.getBusinessAdminBusinessIds(req.decodedToken.subject)
    const nullRemoved = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v != null))
    const business_roles = Object.values(nullRemoved)
    
    const checkAdmin = business_roles.every(business => {
        return business_ids.includes(parseInt(business))
    })

    if (checkAdmin) {
        req.toDelete = Object.keys(nullRemoved)
        next()
    } else {
        res.status(404).json({ message: 'invalid credentials'})
    }
}

//! single business admin validation
const validateBusinessAdminRights = async (req, res, next) => {
    const data = req.body
    const { business_ids } = await db.getBusinessAdminBusinessIds(req.decodedToken.subject)
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
    const userRoles = await db.getEventRolesByUser(req.decodedToken.subject)
        .then(roles => {
            if(roles) {
                return roles.roles
            } else {
                return []
            }
        })
        .catch(err => {
            console.log(err)
        })
    if (userRoles.includes(req.body.venue_id) || userRoles.includes(req.body.brand_id)) {
        // validated user roles
        next()
    } else {
        console.log('invalid admin roles')
        res.status(403).json({ message: 'invalid admin role' });
    }
}

const validateUserAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)
        if (decoded.subject === Number(process.env.ADMIN_ID) && decoded.name === process.env.ADMIN_NAME) {
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
    validateBusinessAdmin,
    validateBusinessAdminRights,
    validateUserRole,
    validateUserAdmin,
}