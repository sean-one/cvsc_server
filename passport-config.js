const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const dbUser = require('./data/models/user');
// const dbRoles = require('./data/models/roles');
// const dbEvents = require('./data/models/event');

const { processAndUploadImage } = require('./utils/s3')
const { comparePassword } = require('./helpers/bcrypt_helper');
const { createAccessToken, createRefreshToken } = require('./helpers/jwt_helper');
const { generateUsername } = require('./helpers/generateUsername');
const authErrors = require('./error_messages/authErrors');
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
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            // check for user to log in
            const google_user = await dbUser.findByGoogleId(profile.id)
            // no user found - register user
            if (google_user.length === 0) {
                let username = generateUsername();
                // let username = profile.displayName
                
                // check for username duplicate
                const found = await dbUser.checkUsernameDuplicate(username)
                
                // if duplicate generate username
                if(found !== undefined) {
                    username = generateUsername()
                }

                const savedProfileImage = await processAndUploadImage(profile.photos[0].value)

                const new_user = {
                    username: username,
                    email: profile.emails[0].value,
                    google_id: profile.id,
                    avatar: savedProfileImage,
                    email_verified: true

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
                if(req.body.logintimestamp && req.body.logintimestamp !== '') { throw new Error('invalid_input') }
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