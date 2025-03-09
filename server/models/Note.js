const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [200, 'Note title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required']
    },
    notebook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notebook',
        required: [true, 'Note must belong to a notebook']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Note must have an author']
    },
    tags: [{
        type: String,
        trim: true
    }],
    versions: [versionSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    aiSummary: {
        type: String,
        default: ''
    },
    aiInsights: [{
        type: String
    }],
    references: [{
        title: String,
        url: String,
        citation: String
    }],
    attachments: [{
        filename: String,
        fileUrl: String,
        fileType: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        wordCount: {
            type: Number,
            default: 0
        },
        readTime: {
            type: Number,
            default: 0
        },
        lastSummarized: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
noteSchema.index({ notebook: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: 'text', content: 'text' }); // Enable text search

// Pre-save middleware to create a new version
noteSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        this.versions.push({
            content: this.content,
            author: this.author
        });

        // Keep only the last 10 versions
        if (this.versions.length > 10) {
            this.versions = this.versions.slice(-10);
        }

        // Update metadata
        this.metadata.wordCount = this.content.split(/\s+/).length;
        this.metadata.readTime = Math.ceil(this.metadata.wordCount / 200); // Assuming 200 words per minute
    }
    next();
});

// Method to get version history
noteSchema.methods.getVersionHistory = function() {
    return this.versions.map(version => ({
        content: version.content,
        timestamp: version.timestamp,
        author: version.author
    }));
};

// Method to restore a previous version
noteSchema.methods.restoreVersion = function(versionId) {
    const version = this.versions.id(versionId);
    if (!version) throw new Error('Version not found');
    
    this.content = version.content;
    return this.save();
};

// Static method to find notes by tag
noteSchema.statics.findByTag = function(tag) {
    return this.find({ tags: tag }).populate('author', 'username');
};

// Static method to search notes
noteSchema.statics.searchNotes = function(query, notebookId = null) {
    const searchQuery = {
        $text: { $search: query }
    };
    
    if (notebookId) {
        searchQuery.notebook = notebookId;
    }
    
    return this.find(searchQuery)
        .select('title content createdAt')
        .sort({ score: { $meta: 'textScore' } });
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
