const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const db = require('./data/models/user');
const { hashPassword, comparePassword } = require('./helpers/bcrypt_helper');
const { createToken } = require('./helpers/jwt_helper');
const authErrors = require('./error_messages/authErrors');

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await db.findById(id)

    // create token then save to user
    const token = createToken(user)
    user.token = token

    done(null, user)
})

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            const google_user = await db.search_google_user(profile.id)
            
            if (google_user.length < 1) {
                const new_user = {
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id,
                    avatar: profile.photos[0].value,

                }

                const added_google_register = await db.add_google_user(new_user)
                
                done(null, added_google_register)
            } else {
                done(null, google_user[0])
            }
        }
    )
)

passport.use(
    new LocalStrategy({
        passReqToCallback: true
    },
        async (req, username, password, done) => {
            try {
                // check for new user
                if(req.body.register) {

                    // check for complete registration
                    const new_user = { username: req.body.username, password: req.body.password, email: req.body.email }
                    if (!new_user.username || !new_user.password || !new_user.email) { throw new Error('incomplete_input') }

                    // check for username duplicate
                    const check_for_username = await db.usernameDuplicate(new_user.username)
                    if(check_for_username) { throw new Error('duplicate_username') }

                    // check for email duplicate
                    const check_for_email = await db.emailDuplicate(new_user.email)
                    if(check_for_email) { throw new Error('duplicate_email') }

                    // hash the password and save to user
                    const hash = await hashPassword(new_user.password)
                    new_user.password = hash

                    // create and register new user
                    const created_user = await db.register_user(new_user)

                    done(null, created_user[0])
                }

                if(!username || !password) { throw new Error('incomplete_input') }
                
                // check for username and validate password
                const [ user ] = await db.findByUsername(username)
                if(user) {
                    const password_verify = await comparePassword(password, user.password)
                    if(!password_verify) throw new Error('invalid_credentials')
    
                    delete user['password']
    
                    done(null, user)
                } else {
                    throw new Error('invalid_credentials')
                }
                
            } catch (error) {
                // extra information added to new user object
                if(error.code === '42703') { return done({ status: 400, message: 'invalid inputs and or fields', type: 'invalid_input'}, false) }
                
                // username or email missing from new user object
                if(error.code === '23502') { return done({ status: 400, message: `${error.column} is a required field`, type: `${error.column}` }, false) }
                
                return done({ status: authErrors[error.message]?.status, message: authErrors[error.message]?.message, type: authErrors[error.message]?.type }, false)
            }
        }
    )
)