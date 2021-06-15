const jwt = require('jsonwebtoken');

const createToken = (user) => {
    const payload = {
        subject: user.id,
        name: user.username,
        role: user.role
    }

    const secret = process.env.JWT_SECRET;
    const options = {
        expiresIn: process.env.JWT_EXPIRES
    }

    return jwt.sign(payload, secret, options);
}

const validateToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {ignoreExpiration: true}, (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'invalid token'})
            } else {
                req.decodedToken = decodedToken;
                next()
            }
        })
    } else {
        res.status(401).json({ message: 'please sign in' })
    }
}

module.exports = {
    createToken,
    validateToken
}