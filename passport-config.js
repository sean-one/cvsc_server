const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy

const db = require('./data/models/user')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await db.findById(id)
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