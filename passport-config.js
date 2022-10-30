const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const dbUser = require('./data/models/user');
const dbRoles = require('./data/models/roles');
const dbEvents = require('./data/models/event');

const { hashPassword, comparePassword } = require('./helpers/bcrypt_helper');
const { createToken } = require('./helpers/jwt_helper');
const authErrors = require('./error_messages/authErrors');

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await dbUser.findById(id)
    // const user_roles = await dbRoles.findByUser_All(id)
    // const user_events = await dbEvents.findByCreator(id) 

    // create token then save to user
    // const token = createToken(user)
    // user.token = token

    done(null, user)
    // done(null, { user: user, user_roles: user_roles || [], user_events: user_events || [] })
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
        // passReqToCallback: true
    },
        async (username, password, done) => {
            try {
                // check if username is in database
                const check_user = await dbUser.findByUsername(username)
                
                // no user found - hash password and create new user
                if(check_user === undefined) {
                    const hash = await hashPassword(password)

                    const new_user = {
                        username: username,
                        password: hash,
                    }

                    const created_user = await dbUser.createUser(new_user)

                    done(null, created_user[0])
                } else {
                    if(!username || !password) { throw new Error('incomplete_input') }

                    const password_verify = await comparePassword(password, check_user.password)
                    if(!password_verify) throw new Error('invalid_credentials')

                    delete check_user['password']

                    done(null, check_user)
                }    
            } catch (error) {
                console.log(error)
                // extra information added to new user object
                if(error.code === '42703') { return done({ status: 400, message: 'invalid inputs and or fields', type: 'invalid_input'}, false) }
                
                // username or email missing from new user object
                if(error.code === '23502') { return done({ status: 400, message: `${error.column} is a required field`, type: `${error.column}` }, false) }
                
                return done({ status: authErrors[error.message]?.status, message: authErrors[error.message]?.message, type: authErrors[error.message]?.type }, false)
            }
        }
    )
)