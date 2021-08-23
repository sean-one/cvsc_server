const jwt = require('jsonwebtoken');

const db = require('../data/models/roles');

const createToken = (user) => {
    const payload = {
        subject: user.id,
        name: user.username,
        roles: user.roles
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
        console.log(error.name, error.message, error.expiredAt)
        if(error.name === 'TypeError') {
            res.status(401).json({ message: 'missing token' })
        } else if(error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'invalid signature' })
        } else {
            console.log('error')
            console.log(error)
            res.status(500).json({ message: 'server error' })
        }
    }
}

const validateUser = async (req, res, next) => {
    const userRoles = await db.findByUser(req.decodedToken.subject)
        .then(roles => {
            return roles.roles
        })
        .catch(err => console.log(err))
    if (userRoles.includes(req.body.venue_id) || userRoles.includes(req.body.brand_id)) {
        // validated user roles
        next()
    } else {
        res.status(403).json({ message: 'invalid admin role' });
    }
    // console.log(req.body.venue_id, req.body.brand_id, req.decodedToken.roles)
}

module.exports = {
    createToken,
    validateToken,
    validateUser
}