const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return res.status(504).json({
            success: false,
            error: 'Request timed out',
            message: 'The upstream service took too long to respond. Please try again.',
        });
    }

    if (err.name === 'MongoServerSelectionError' || err.code === 'ETIMEDOUT') {
        return res.status(503).json({
            success: false,
            error: 'Database unavailable',
            message: 'MongoDB is not reachable right now. Please try again later.',
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: Object.values(err.errors)
                .map((e) => e.message)
                .join(', '),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate Field',
            message: 'This value already exists',
        });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        message: err.details || undefined,
    });
};

module.exports = errorHandler;
