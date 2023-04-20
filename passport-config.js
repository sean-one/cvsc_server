const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const dbUser = require('./data/models/user');
// const dbRoles = require('./data/models/roles');
// const dbEvents = require('./data/models/event');

const { hashPassword, comparePassword } = require('./helpers/bcrypt_helper');
const { createAccessToken, createRefreshToken } = require('./helpers/jwt_helper');
const authErrors = require('./error_messages/authErrors');

passport.serializeUser(async (user, done) => {
    const accessToken = createAccessToken(user.id)
    const refreshToken = createRefreshToken(user.id)
    user.refreshToken = refreshToken
    user.accessToken = accessToken

    await dbUser.addRefreshToken(user.id, refreshToken)
    
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await dbUser.findUserById(id)

    done(null, user)
})


// Google login strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            // check for user to log in
            const google_user = await dbUser.findByGoogleId(profile.id)
            
            // no user found - register user
            if (google_user.length < 1) {
                const new_user = {
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id,
                    avatar: profile.photos[0].value,

                }
                // create new user with google information
                const created_user = await dbUser.createUser(new_user)
                
                done(null, created_user[0])
            } else {
                done(null, google_user[0])
            }
        }
    )
)

// Local login strategy
passport.use(
    new LocalStrategy({
        passReqToCallback: true
    },
        async (req, username, password, done) => {
            try {
                // check if request is from 'register' or 'login' page
                const requested_from = req.headers.referer.substring(req.headers.referer.lastIndexOf('/') + 1, req.headers.referer.length)
                
                if (requested_from === 'login') {
                    if(!username || !password) { throw new Error('incomplete_input') }
                    
                    // get user from database
                    const check_user = await dbUser.findByUsername(username)
                    
                    // if no user is found then return error
                    if (check_user === undefined) {
                        throw new Error('invalid_credentials')
                    }

                    // if a user is found, verify the user passowrd
                    const password_verify = await comparePassword(password, check_user.password)
                    if (!password_verify) { throw new Error('invalid_credentials') }

                    // remove encrypted password from retur
                    delete check_user['password']
                    
                    done(null, check_user)
                } else if (requested_from === 'register') {
                    
                    // hash inputed password
                    const hash = await hashPassword(password)
                    
                    // create new user object to inser
                    const new_user = { username: username, password: hash, email: req.body.email }

                    // insert new user
                    const created_user = await dbUser.createUser(new_user)

                    done(null, created_user[0])
                } else {
                    throw new Error('invalid_origin')
                }
            } catch (error) {
                console.log('passport-config')
                console.log(error.message)
                // duplicated username error
                if (error.constraint === 'users_username_unique') { return done({
                    status: authErrors['duplicate_username']?.status,
                    message: authErrors['duplicate_username']?.message,
                    type: authErrors['duplicate_username']?.type,
                    }, false)
                }
                // extra information added to new user object
                if(error.code === '42703') { return done({ 
                    status: 400,
                    message: 'invalid inputs and or fields',
                    type: 'invalid_input'}, false)
                }
                
                // username or email missing from new user object
                if(error.code === '23502') { return done({ status: 400, message: `${error.column} is a required field`, type: `${error.column}` }, false) }
                
                return done({ status: authErrors[error.message]?.status, message: authErrors[error.message]?.message, type: authErrors[error.message]?.type }, false)
            }
        }
    )
)