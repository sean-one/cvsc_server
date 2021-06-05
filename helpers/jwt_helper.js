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

module.exports = {
    createToken
}