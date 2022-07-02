require('dotenv').config()

const express = require('express');
const app = express()
const morgan = require('morgan')
const cors = require('cors');
const session = require('express-session');
const passport = require('passport')
const fileUpload = require('express-fileupload');

// routes
const contactRouter = require('./routes/contactRoute');
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoute');
const eventRouter = require('./routes/eventRoute');
const businessRouter = require('./routes/businessRoute');
const locationRouter = require('./routes/locationRoute');
const roleRouter = require('./routes/roleRoute');
const s3Router = require('./routes/s3Route');
const errorHandler = require('./helpers/errorHandler');

const passportSetup = require('./passport-config');

app.use(fileUpload({
    createParentPath: true
}))

app.use(morgan(':date[clf] :method :url :status :response-time ms - :res[content-length]'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ['http://localhost:3000', process.env.FRONTEND_CLIENT, /\.localhost:3000/],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use(
    session({
        name: 'cv_smoker',
        secret: process.env.COOKIE_SECRET,
        cookie: {
            maxAge: 60 * 60 * 24 * 1000,
            secure: process.env.NODE_ENV === "production" ? "true" : "auto",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session())

app.use('/contacts', contactRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/business', businessRouter);
app.use('/locations', locationRouter);
app.use('/roles', roleRouter);
app.use('/s3', s3Router);

app.use(errorHandler)

app.get('/', (req, res) => {
    res.send('WELCOME TO THE ROOT OF IT ALL')
})

app.listen(process.env.PORT, () => {
    console.log(`Server running...`);
})