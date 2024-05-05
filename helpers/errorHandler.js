


const errorHandler = (error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            type: error.type || 'error'
        }
    })
}

module.exports = errorHandler;