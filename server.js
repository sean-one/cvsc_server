require('dotenv').config()

const express = require('express');
const app = express()
const cron = require('./cronJobs');
const morgan = require('morgan')
const cors = require('cors');
const session = require('express-session');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const DynamoDBStore = require('connect-dynamodb')({session: session});
const cookieParser = require('cookie-parser');

const passport = require('passport')

// routes
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoute');
const eventRouter = require('./routes/eventRoute');
const businessRouter = require('./routes/businessRoute');
const roleRouter = require('./routes/roleRoute');
const s3Router = require('./routes/s3Route');
const errorHandler = require('./helpers/errorHandler');

const passportSetup = require('./passport-config');


app.use(morgan(':date[clf] :method :url :status :response-time ms - :res[content-length]'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(cors({
    origin: process.env.FRONTEND_CLIENT,
    optionsSuccessStatus: 200,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true,
}));

const dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESSKEYID,
        secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    }

})

app.use(
    session({
        name: 'cv_smoker',
        secret: process.env.COOKIE_SECRET,
        cookie: {
            maxAge: 60 * 60 * 24 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
        store: process.env.NODE_ENV === 'production' ? new DynamoDBStore({
            client: dynamoDBClient,
            table: process.env.AWS_DYNAMODB_TABLE,
            TTL: 86400,
            hashKey: 'sessionId',
            ttlAttributeName: 'expiresAt',
            readCapacityUnits: 5,
            writeCapacityUnits: 5,
        }) : undefined,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session())



app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/businesses', businessRouter);
app.use('/roles', roleRouter);
app.use('/s3', s3Router);


app.get('/', (req, res) => {
    res.send('WELCOME TO THE ROOT OF IT ALL')
})

app.use(errorHandler)


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

    URL: ${process.env.NODE_ENV === 'production' ? 'api.coachellavalleysmokersclub.com' : 'localhost:3333'}

    Time: ${now.toLocaleString()}

    ==========================================
    `)
}



app.listen(process.env.PORT, serverStartMessage);
