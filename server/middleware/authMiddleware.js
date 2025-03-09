const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Middleware to handle roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Middleware to check notebook access
const checkNotebookAccess = async (req, res, next) => {
    try {
        const notebook = await req.notebook;
        if (!notebook.hasAccess(req.user._id, 'editor')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this notebook'
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check note access
const checkNoteAccess = async (req, res, next) => {
    try {
        const note = await req.note;
        const notebook = await note.notebook;
        
        if (!notebook.hasAccess(req.user._id, 'editor')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this note'
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    protect,
    authorize,
    checkNotebookAccess,
    checkNoteAccess
};
