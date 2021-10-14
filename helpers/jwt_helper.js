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
        next()
    } else {
        res.status(404).json({ message: 'wrong user' })
    }
}


const validateUserRole = async (req, res, next) => {
    console.log(req.decodedToken.subject)
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

// const validateUserRequest = async (req, res, next) => {
//     const userId
// }

module.exports = {
    createToken,
    validateToken,
    validateUser,
    validateUserRole,
    // validateUserRequest
}