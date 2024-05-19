const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const dbUser = require('./data/models/user');

const { processAndUploadImage } = require('./utils/s3')
const { comparePassword } = require('./helpers/bcrypt_helper');
const { normalizeEmail } = require('./helpers/normalizeEmail');
const { createAccessToken, createRefreshToken } = require('./helpers/jwt_helper');
const { generateUsername } = require('./helpers/generateUsername');
const userErrors = require('./error_messages/userErrors');

passport.serializeUser(async (user, done) => {
    const accessToken = createAccessToken(user.id)
    const refreshToken = createRefreshToken(user.id)
    user.refreshToken = refreshToken
    user.accessToken = accessToken

    await dbUser.addRefreshToken(user.id, refreshToken)
    
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await dbUser.getUserAccount(id)

    done(null, user)
})

// Google login strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            // check for user to log in
            const google_user = await dbUser.findByGoogleId(profile.id)

            if (google_user) {
                return done(null, google_user);
            }
            
            // check for email in database
            const normalizedEmail = normalizeEmail(profile.emails[0].value)
            const emailCheck = await dbUser.findByEmail(normalizedEmail)
            if (emailCheck) {
                if (emailCheck.email_verified) {
                    // const emailCheckError = new Error('google_verified')
                    return done({ status: 400, message: 'google_email_duplicate', type: 'server'}, false)
                } else {
                    await dbUser.removeUser(emailCheck.id)
                }
            }

            // no user found - register user
            const savedProfileImage = await processAndUploadImage(profile.photos[0].value)
            const username = await generateUsername()

            const new_user = {
                username: username,
                email: normalizedEmail,
                google_id: profile.id,
                avatar: savedProfileImage,
                email_verified: true
            }
            
            // create new user with google information
            const created_user = await dbUser.createUser(new_user)
            
            done(null, created_user[0])
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
                if(req.body.logintimestamp && req.body.logintimestamp !== '') { throw new Error('invalid_input') }
                if(!username || !password) { throw new Error('incomplete_input') }
                
                // get user from database
                const check_user = await dbUser.findByUsername(username)
                
                // if no user is found then return error
                if (check_user === undefined || check_user.password === null) {
                    throw new Error('invalid_credentials')
                }

                // if a user is found, verify the user passowrd
                const password_verify = await comparePassword(password, check_user.password)
                if (!password_verify) { throw new Error('invalid_credentials') }

                // remove encrypted password from retur
                delete check_user['password']
                
                done(null, check_user)

            } catch (error) {

                return done({
                    status: userErrors[error.message]?.status,
                    message: userErrors[error.message]?.message,
                    type: userErrors[error.message]?.type
                }, false)
            }
        }
    )
)