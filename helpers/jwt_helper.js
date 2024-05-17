const jwt = require('jsonwebtoken');
const tokenErrors = require('../error_messages/tokenErrors');
const db = require('../data/models/user');

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

const createEmailValidationToken = (user_id, email) => {
    const expiresIn = '15m';
    return jwt.sign({ userId: user_id, email: email }, process.env.JWT_SECRET, { expiresIn: expiresIn });
}

const createResetPasswordToken = (email) => {
    const expiresIn = '1h'
    return jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: expiresIn });
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

const emailVerified = async (req, res, next) => {
    try {
        const user_id = req.user_decoded;
        if (!user_id) { throw new Error('no_user_id') }

        const verified_user = await db.findUserById(user_id)
        if (!verified_user) { throw new Error('user_not_found') }

        if (verified_user?.email_verified) {
            next()
        } else {
            throw new Error('not_verified')
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

const SquirrelCheck = async (req, res, next) => {
    try {
        const cookies = req.cookies

        if (!cookies.jwt) throw new Error('no_token')
        
        const user_decoded = jwt.verify(cookies.jwt, process.env.JWT_REFRESHTOKEN_SECRET, 'invalid_token')

        const squirrelmaster = await db.findUserById(user_decoded.user)
        if (!squirrelmaster) {
            throw new Error('invalid_token')
        }

        if (!squirrelmaster.is_superadmin) {
            throw new Error('invalid_credentials')
        } else {
            next()
        }
    } catch (error) {
        if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
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
    createEmailValidationToken,
    createResetPasswordToken,
    validToken,
    emailVerified,
    SquirrelCheck,
}