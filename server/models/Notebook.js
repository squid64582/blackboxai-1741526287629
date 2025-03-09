const mongoose = require('mongoose');

const notebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notebook title is required'],
        trim: true,
        maxlength: [100, 'Notebook title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notebook must belong to a user']
    },
    color: {
        type: String,
        default: '#ffffff'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['reader', 'editor'],
            default: 'reader'
        }
    }],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        allowComments: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for notes
notebookSchema.virtual('notes', {
    ref: 'Note',
    localField: '_id',
    foreignField: 'notebook'
});

// Index for faster queries
notebookSchema.index({ owner: 1, title: 1 });
notebookSchema.index({ 'collaborators.user': 1 });

// Pre-save middleware to update lastModified
notebookSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

// Method to check if user has access to notebook
notebookSchema.methods.hasAccess = function(userId, requiredRole = 'reader') {
    if (this.owner.equals(userId)) return true;
    
    const collaborator = this.collaborators.find(c => c.user.equals(userId));
    if (!collaborator) return false;
    
    if (requiredRole === 'reader') return true;
    return collaborator.role === 'editor';
};

// Static method to find accessible notebooks
notebookSchema.statics.findAccessible = function(userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'collaborators.user': userId },
            { 'settings.isPublic': true }
        ]
    });
};

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = Notebook;
