import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  AutoAwesome as AIIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import {
  updateNote,
  getVersionHistory,
  restoreVersion,
  generateAISummary,
  generateAIInsights
} from '../../store/slices/noteSlice';
import { setSelectedItem, setModal } from '../../store/slices/uiSlice';

const AUTOSAVE_DELAY = 2000; // 2 seconds

const NoteEditor = () => {
  const { notebookId, noteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentNote, loading, versionHistory } = useSelector((state) => state.notes);
  const { aiFeatures } = useSelector((state) => state.notes);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setTags(currentNote.tags || []);
    }
  }, [currentNote]);

  const saveNote = useCallback(async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await dispatch(updateNote({
        id: noteId,
        noteData: {
          title,
          content,
          tags
        }
      })).unwrap();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  }, [dispatch, noteId, title, content, tags]);

  // Autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNote && (
        title !== currentNote.title ||
        content !== currentNote.content ||
        JSON.stringify(tags) !== JSON.stringify(currentNote.tags)
      )) {
        saveNote();
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [title, content, tags, currentNote, saveNote]);

  const handleDelete = () => {
    dispatch(setSelectedItem({ type: 'noteToDelete', item: currentNote }));
    dispatch(setModal({ modal: 'deleteConfirmation', open: true }));
  };

  const handleVersionHistory = async () => {
    await dispatch(getVersionHistory(noteId));
    setShowVersions(true);
  };

  const handleRestoreVersion = async (versionId) => {
    try {
      await dispatch(restoreVersion({ noteId, versionId })).unwrap();
      setShowVersions(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handleGenerateAIFeatures = async () => {
    try {
      await Promise.all([
        dispatch(generateAISummary(noteId)),
        dispatch(generateAIInsights(noteId))
      ]);
      setShowAIInsights(true);
    } catch (error) {
      console.error('Failed to generate AI features:', error);
    }
  };

  const handleAddTag = (event) => {
    if (event.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Notebook">
            <IconButton onClick={() => navigate(`/notebooks/${notebookId}`)}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            variant="standard"
            fullWidth
            sx={{ mr: 2 }}
          />

          <Tooltip title="Save">
            <IconButton onClick={saveNote} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : <SaveIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Version History">
            <IconButton onClick={handleVersionHistory}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="AI Insights">
            <IconButton onClick={handleGenerateAIFeatures}>
              <AIIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Tags */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              size="small"
            />
          ))}
          <TextField
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleAddTag}
            placeholder="Add tag..."
            size="small"
            variant="standard"
            sx={{ minWidth: 100 }}
          />
        </Box>
      </Paper>

      {/* Editor */}
      <Paper
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={modules}
          style={{ height: '100%' }}
        />
      </Paper>

      {/* Version History Dialog */}
      <Dialog
        open={showVersions}
        onClose={() => setShowVersions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          {versionHistory[noteId]?.map((version) => (
            <Box
              key={version._id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2">
                {new Date(version.createdAt).toLocaleString()}
              </Typography>
              <Button
                size="small"
                onClick={() => handleRestoreVersion(version._id)}
              >
                Restore this version
              </Button>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersions(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog
        open={showAIInsights}
        onClose={() => setShowAIInsights(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI Insights</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Summary</Typography>
          <Typography paragraph>
            {aiFeatures.summaries[noteId] || 'No summary available'}
          </Typography>

          <Typography variant="h6" gutterBottom>Key Insights</Typography>
          <Typography paragraph>
            {aiFeatures.insights[noteId] || 'No insights available'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIInsights(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoteEditor;
