const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy

const db = require('./data/models/user');
const { comparePassword } = require('./helpers/bcrypt_helper');
const { createToken } = require('./helpers/jwt_helper');

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
                
                done(null, added_google_register[0])
            } else {
                done(null, google_user[0])
            }
        }
    )
)

passport.use(
    new LocalStrategy(
        async (username, password, done) => {
            try {
                if(!username || !password) throw new Error('incomplete_input')
                
                const [ user ] = await db.findByUsername(username)
                if(!user) throw new Error('user_not_found')
                
                const password_verify = await comparePassword(password, user.password)
                if(!password_verify) throw new Error('invalid_credentials')

                delete user['password']

                done(null, user)
            } catch (error) {
                console.log(error)
                return done(null, false)
            }
        }
    )
)

// passport.use('local-signup', new LocalStrategy({
//     usernameField: 'username',
//     passwordField: 'password',
//     //are there other options?
//     //emailField did not seem to do anything
//     passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
// },
// function(req, email, password, done) {
//     //check if email not already in database
//         //create new user using "email" and "password"
//         //I want an additional parameter here "name"
// }));