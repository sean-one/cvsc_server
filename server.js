require('dotenv').config()

const express = require('express');
const app = express()
const morgan = require('morgan')
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const passport = require('passport')
// const fileUpload = require('express-fileupload');

// routes
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoute');
const eventRouter = require('./routes/eventRoute');
const businessRouter = require('./routes/businessRoute');
const roleRouter = require('./routes/roleRoute');
const s3Router = require('./routes/s3Route');
const errorHandler = require('./helpers/errorHandler');

const passportSetup = require('./passport-config');

// REMOVED SO THAT MULTER WOULD WORK
// app.use(fileUpload({
//     createParentPath: true
// }))

app.use(morgan(':date[clf] :method :url :status :response-time ms - :res[content-length]'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(
    session({
        name: 'cv_smoker',
        secret: process.env.COOKIE_SECRET,
        cookie: {
            maxAge: 60 * 60 * 24 * 1000,
            // secure: process.env.NODE_ENV === "production" ? "true" : "auto",
            secure: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session())

app.use(cors({
    origin: [process.env.FRONTEND_CLIENT, "http://192.168.1.36:3000", /\.localhost:3000/ ],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true,
}));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/businesses', businessRouter);
app.use('/roles', roleRouter);
app.use('/s3', s3Router);

app.use(errorHandler)

app.get('/', (req, res) => {
    res.send('WELCOME TO THE ROOT OF IT ALL')
})

const serverStartMessage = () => {
    const now = new Date();
    
    const asciiArt = `
      /$$$$$$  /$$    /$$  /$$$$$$   /$$$$$$ 
     /$$__  $$| $$   | $$ /$$__  $$ /$$__  $$
    | $$  \\__/| $$   | $$| $$  \\__/| $$  \\__/
    | $$      |  $$ / $$/|  $$$$$$ | $$      
    | $$       \\  $$ $$/  \\____  $$| $$      
    | $$    $$  \\  $$$/   /$$  \\ $$| $$    $$
    |  $$$$$$/   \\  $/   |  $$$$$$/|  $$$$$$/
     \\______/     \\_/     \\______/  \\______/                                         
    `
    console.log(`
    ==========================================
    ${asciiArt}

    Server is running!

    URL: http://localhost:${process.env.PORT}

    Time: ${now.toLocaleString()}

    ==========================================
    `)
}



app.listen(process.env.PORT, serverStartMessage);