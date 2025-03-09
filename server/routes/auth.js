const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const { catchAsync, APIError } = require('../middleware/errorMiddleware');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', catchAsync(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
    });

    if (userExists) {
        throw new APIError('User already exists', 400);
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            }
        });
    }
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new APIError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
        success: true,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        }
    });
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    res.json({
        success: true,
        data: user.getPublicProfile()
    });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new APIError('User not found', 404);
    }

    // Update fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

    const updatedUser = await user.save();

    res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture
        }
    });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new APIError('User not found', 404);
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Save it to the user document with an expiry
    // 3. Send an email with the reset link
    // For this demo, we'll just send a success message

    res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link will be sent.'
    });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', catchAsync(async (req, res) => {
    const { token, password } = req.body;

    // In a real application, you would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the password
    // For this demo, we'll just send a success message

    res.json({
        success: true,
        message: 'Password has been reset successfully.'
    });
}));

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
