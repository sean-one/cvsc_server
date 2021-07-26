require('dotenv').config()

const express = require('express');
const app = express()
const morgan = require('morgan')
const cors = require('cors');

// routes
const userRouter = require('./routes/userRoute');
const eventRouter = require('./routes/eventRoute');
const businessRouter = require('./routes/businessRoute');
const locationRouter = require('./routes/locationRoute');
const roleRouter = require('./routes/roleRoute');

app.use(morgan('dev'));

app.use(express.json())
app.use(cors({
    origin: [process.env.FRONTEND_CLIENT],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/business', businessRouter);
app.use('/locations', locationRouter);
app.use('/roles', roleRouter);

app.get('/', (req, res) => {
    res.send('WELCOME TO THE ROOT OF IT ALL')
})

app.listen(process.env.PORT, () => {
    console.log(`Server running...`);
})