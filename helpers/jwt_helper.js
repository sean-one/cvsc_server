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

const validateAdmin = async (req, res, next) => {
    
    // roles.admin returns [business_id] with admin rights
    const roles = await db.getUserAdminRoles(req.decodedToken.subject)
    const roleRequest = [ ...req.body.approved, ...req.body.rejected ]
    
    // validate approved & rejected list
    for (let requestLine of roleRequest) {
        if (!roles.admin.includes(requestLine.business_id)) {
            res.status(403).json({ message: 'forbidden - invalid role' })
        }
    }

    // console.log('checked & passed!')
    next()
}

const validateAdminRoleDelete = async (req, res, next) => {
    const roleIds = []
    const userRoles = await db.getEventRolesByUser(req.decodedToken.subject)
        .then(roles => {
            if (roles) {
                return roles.roles
            } else {
                return []
            }
        })
        .catch(err => {
            console.log(err)
        })
    for (let roleEdit of req.body) {
        if (userRoles.includes(roleEdit.business_id)) {
            roleIds.push(roleEdit.id)
            continue
        } else {
            res.status(403).json({ message: 'invalid admin role' });
        }
    }
    req.body.roleIds = roleIds
    console.log('admin checked')
    next()
}

const validateUser = (req, res, next) => {
    if (req.params.id.toString() === req.decodedToken.subject.toString()) {
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
    }
}


const validateUserRole = async (req, res, next) => {
    const userRoles = await db.getEventRolesByUser(req.decodedToken.subject)
        .then(roles => {
            console.log(roles)
            if(roles) {
                return roles.roles
            } else {
                return []
            }
        })
        .catch(err => {
            console.log(err)
        })
    console.log(userRoles)
    if (userRoles.includes(req.body.venue_id) || userRoles.includes(req.body.brand_id)) {
        // validated user roles
        next()
    } else {
        console.log('invalid admin roles')
        res.status(403).json({ message: 'invalid admin role' });
    }
    // console.log(req.body.venue_id, req.body.brand_id, req.decodedToken.roles)
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

// const validateUserRequest = async (req, res, next) => {
//     const userId
// }

module.exports = {
    createToken,
    validateToken,
    validateAdmin,
    validateAdminRoleDelete,
    validateUser,
    validateUserRole,
    validateUserAdmin,
    // validateUserRequest
}