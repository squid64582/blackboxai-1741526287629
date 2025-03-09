// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production error response
        if (err.isOperational) {
            // Operational, trusted error: send message to client
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or other unknown error: don't leak error details
            console.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new APIError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new APIError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => 
    new APIError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => 
    new APIError('Your token has expired! Please log in again.', 401);

// Catch async errors
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Not found error handler
const notFound = (req, res, next) => {
    const error = new APIError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler setup
const setupErrorHandling = (app) => {
    app.use(notFound);
    
    app.use((err, req, res, next) => {
        let error = { ...err };
        error.message = err.message;

        // MongoDB duplicate key
        if (error.code === 11000) error = handleDuplicateKeyError(error);
        
        // Mongoose validation error
        if (err.name === 'ValidationError') error = handleValidationError(err);
        
        // JWT errors
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        errorHandler(error, req, res, next);
    });
};

module.exports = {
    APIError,
    errorHandler,
    catchAsync,
    notFound,
    setupErrorHandling
};
