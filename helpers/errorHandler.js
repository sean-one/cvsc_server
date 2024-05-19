const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        console.error('Headers already sent:', error);
        return next(error);
    }
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            type: error.type || 'error'
        }
    });
}

module.exports = errorHandler;
