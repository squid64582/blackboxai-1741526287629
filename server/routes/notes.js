const express = require('express');
const router = express.Router();
const { protect, checkNotebookAccess, checkNoteAccess } = require('../middleware/authMiddleware');
const { catchAsync, APIError } = require('../middleware/errorMiddleware');
const Note = require('../models/Note');
const Notebook = require('../models/Notebook');

// Middleware to get note by ID
const getNote = catchAsync(async (req, res, next) => {
    const note = await Note.findById(req.params.id)
        .populate('notebook', 'title owner collaborators');
    
    if (!note) {
        throw new APIError('Note not found', 404);
    }
    
    req.note = note;
    next();
});

// @desc    Get all notes in a notebook
// @route   GET /api/notes/notebook/:notebookId
// @access  Private
router.get('/notebook/:notebookId', protect, catchAsync(async (req, res) => {
    const notebook = await Notebook.findById(req.params.notebookId);
    
    if (!notebook) {
        throw new APIError('Notebook not found', 404);
    }

    if (!notebook.hasAccess(req.user._id)) {
        throw new APIError('Not authorized to access this notebook', 403);
    }

    const notes = await Note.find({ notebook: req.params.notebookId })
        .populate('author', 'username email')
        .sort('-updatedAt');

    res.json({
        success: true,
        count: notes.length,
        data: notes
    });
}));

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
router.post('/', protect, catchAsync(async (req, res) => {
    const notebook = await Notebook.findById(req.body.notebook);
    
    if (!notebook) {
        throw new APIError('Notebook not found', 404);
    }

    if (!notebook.hasAccess(req.user._id, 'editor')) {
        throw new APIError('Not authorized to create notes in this notebook', 403);
    }

    const note = await Note.create({
        ...req.body,
        author: req.user._id
    });

    res.status(201).json({
        success: true,
        data: note
    });
}));

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
router.get('/:id', protect, getNote, catchAsync(async (req, res) => {
    const note = await req.note
        .populate('author', 'username email')
        .populate('notebook', 'title owner collaborators');

    if (!note.notebook.hasAccess(req.user._id)) {
        throw new APIError('Not authorized to access this note', 403);
    }

    res.json({
        success: true,
        data: note
    });
}));

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
router.put('/:id', protect, getNote, checkNoteAccess, catchAsync(async (req, res) => {
    const allowedUpdates = ['title', 'content', 'tags', 'status'];
    const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    const note = await Note.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).populate('author', 'username email')
     .populate('notebook', 'title');

    res.json({
        success: true,
        data: note
    });
}));

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', protect, getNote, checkNoteAccess, catchAsync(async (req, res) => {
    await req.note.remove();

    res.json({
        success: true,
        data: {}
    });
}));

// @desc    Get note version history
// @route   GET /api/notes/:id/versions
// @access  Private
router.get('/:id/versions', protect, getNote, catchAsync(async (req, res) => {
    if (!req.note.notebook.hasAccess(req.user._id)) {
        throw new APIError('Not authorized to access this note', 403);
    }

    const versions = req.note.getVersionHistory();

    res.json({
        success: true,
        count: versions.length,
        data: versions
    });
}));

// @desc    Restore note version
// @route   POST /api/notes/:id/versions/:versionId/restore
// @access  Private
router.post('/:id/versions/:versionId/restore', protect, getNote, checkNoteAccess, catchAsync(async (req, res) => {
    await req.note.restoreVersion(req.params.versionId);

    res.json({
        success: true,
        data: req.note
    });
}));

// @desc    Search notes
// @route   GET /api/notes/search
// @access  Private
router.get('/search', protect, catchAsync(async (req, res) => {
    const { query, notebook } = req.query;

    // Get all notebooks user has access to
    const accessibleNotebooks = await Notebook.findAccessible(req.user._id);
    const notebookIds = accessibleNotebooks.map(n => n._id);

    let searchQuery = {
        $text: { $search: query },
        notebook: { $in: notebookIds }
    };

    if (notebook) {
        const specificNotebook = await Notebook.findById(notebook);
        if (!specificNotebook || !specificNotebook.hasAccess(req.user._id)) {
            throw new APIError('Notebook not found or access denied', 404);
        }
        searchQuery.notebook = notebook;
    }

    const notes = await Note.find(searchQuery)
        .select('title content createdAt notebook')
        .populate('notebook', 'title')
        .sort({ score: { $meta: 'textScore' } });

    res.json({
        success: true,
        count: notes.length,
        data: notes
    });
}));

// @desc    Add attachment to note
// @route   POST /api/notes/:id/attachments
// @access  Private
router.post('/:id/attachments', protect, getNote, checkNoteAccess, catchAsync(async (req, res) => {
    const { filename, fileUrl, fileType } = req.body;

    req.note.attachments.push({
        filename,
        fileUrl,
        fileType
    });

    await req.note.save();

    res.json({
        success: true,
        data: req.note
    });
}));

// @desc    Remove attachment from note
// @route   DELETE /api/notes/:id/attachments/:attachmentId
// @access  Private
router.delete('/:id/attachments/:attachmentId', protect, getNote, checkNoteAccess, catchAsync(async (req, res) => {
    req.note.attachments = req.note.attachments
        .filter(a => a._id.toString() !== req.params.attachmentId);
    
    await req.note.save();

    res.json({
        success: true,
        data: req.note
    });
}));

module.exports = router;
