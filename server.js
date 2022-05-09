require('dotenv').config()

const express = require('express');
const app = express()
const morgan = require('morgan')
const cors = require('cors');
const fileUpload = require('express-fileupload');

// routes
const contactRouter = require('./routes/contactRoute')
const userRouter = require('./routes/userRoute');
const eventRouter = require('./routes/eventRoute');
const businessRouter = require('./routes/businessRoute');
const locationRouter = require('./routes/locationRoute');
const roleRouter = require('./routes/roleRoute');
const s3Router = require('./routes/s3Route');
const errorHandler = require('./helpers/errorHandler')

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

app.use('/contacts', contactRouter);
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