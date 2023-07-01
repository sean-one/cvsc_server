


const errorHandler = (error, req, res, next) => {
    // console.log('inside errorHandler')
    console.log('inside errorHandler')
    console.log(error)
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            type: error.type || 'error'
        }
    })
}

module.exports = errorHandler;