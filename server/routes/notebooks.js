const express = require('express');
const router = express.Router();
const { protect, checkNotebookAccess } = require('../middleware/authMiddleware');
const { catchAsync, APIError } = require('../middleware/errorMiddleware');
const Notebook = require('../models/Notebook');
const Note = require('../models/Note');

// Middleware to get notebook by ID
const getNotebook = catchAsync(async (req, res, next) => {
    const notebook = await Notebook.findById(req.params.id);
    
    if (!notebook) {
        throw new APIError('Notebook not found', 404);
    }
    
    req.notebook = notebook;
    next();
});

// @desc    Get all notebooks for a user
// @route   GET /api/notebooks
// @access  Private
router.get('/', protect, catchAsync(async (req, res) => {
    const notebooks = await Notebook.findAccessible(req.user._id)
        .populate('owner', 'username email')
        .populate('collaborators.user', 'username email')
        .sort('-updatedAt');

    res.json({
        success: true,
        count: notebooks.length,
        data: notebooks
    });
}));

// @desc    Create new notebook
// @route   POST /api/notebooks
// @access  Private
router.post('/', protect, catchAsync(async (req, res) => {
    const notebook = await Notebook.create({
        ...req.body,
        owner: req.user._id
    });

    res.status(201).json({
        success: true,
        data: notebook
    });
}));

// @desc    Get single notebook
// @route   GET /api/notebooks/:id
// @access  Private
router.get('/:id', protect, getNotebook, catchAsync(async (req, res) => {
    const notebook = await req.notebook
        .populate('owner', 'username email')
        .populate('collaborators.user', 'username email')
        .populate({
            path: 'notes',
            select: 'title content createdAt updatedAt',
            options: { sort: '-updatedAt' }
        });

    // Check if user has access
    if (!notebook.hasAccess(req.user._id)) {
        throw new APIError('Not authorized to access this notebook', 403);
    }

    res.json({
        success: true,
        data: notebook
    });
}));

// @desc    Update notebook
// @route   PUT /api/notebooks/:id
// @access  Private
router.put('/:id', protect, getNotebook, checkNotebookAccess, catchAsync(async (req, res) => {
    const allowedUpdates = ['title', 'description', 'color', 'tags', 'settings'];
    const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    const notebook = await Notebook.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).populate('owner', 'username email')
     .populate('collaborators.user', 'username email');

    res.json({
        success: true,
        data: notebook
    });
}));

// @desc    Delete notebook
// @route   DELETE /api/notebooks/:id
// @access  Private
router.delete('/:id', protect, getNotebook, checkNotebookAccess, catchAsync(async (req, res) => {
    // Delete all notes in the notebook
    await Note.deleteMany({ notebook: req.params.id });
    
    // Delete the notebook
    await req.notebook.remove();

    res.json({
        success: true,
        data: {}
    });
}));

// @desc    Add collaborator to notebook
// @route   POST /api/notebooks/:id/collaborators
// @access  Private
router.post('/:id/collaborators', protect, getNotebook, checkNotebookAccess, catchAsync(async (req, res) => {
    const { userId, role } = req.body;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
        throw new APIError('User not found', 404);
    }

    // Check if user is already a collaborator
    const isCollaborator = req.notebook.collaborators
        .find(c => c.user.toString() === userId);
    
    if (isCollaborator) {
        throw new APIError('User is already a collaborator', 400);
    }

    req.notebook.collaborators.push({ user: userId, role });
    await req.notebook.save();

    res.json({
        success: true,
        data: req.notebook
    });
}));

// @desc    Remove collaborator from notebook
// @route   DELETE /api/notebooks/:id/collaborators/:userId
// @access  Private
router.delete('/:id/collaborators/:userId', protect, getNotebook, checkNotebookAccess, catchAsync(async (req, res) => {
    req.notebook.collaborators = req.notebook.collaborators
        .filter(c => c.user.toString() !== req.params.userId);
    
    await req.notebook.save();

    res.json({
        success: true,
        data: req.notebook
    });
}));

// @desc    Archive notebook
// @route   PUT /api/notebooks/:id/archive
// @access  Private
router.put('/:id/archive', protect, getNotebook, checkNotebookAccess, catchAsync(async (req, res) => {
    req.notebook.isArchived = !req.notebook.isArchived;
    await req.notebook.save();

    res.json({
        success: true,
        data: req.notebook
    });
}));

// @desc    Get notebook statistics
// @route   GET /api/notebooks/:id/stats
// @access  Private
router.get('/:id/stats', protect, getNotebook, catchAsync(async (req, res) => {
    const stats = await Note.aggregate([
        { $match: { notebook: req.notebook._id } },
        {
            $group: {
                _id: null,
                totalNotes: { $sum: 1 },
                totalWords: { $sum: '$metadata.wordCount' },
                avgReadTime: { $avg: '$metadata.readTime' }
            }
        }
    ]);

    res.json({
        success: true,
        data: stats[0] || {
            totalNotes: 0,
            totalWords: 0,
            avgReadTime: 0
        }
    });
}));

module.exports = router;
