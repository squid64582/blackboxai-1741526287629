import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { setModal } from '../../store/slices/uiSlice';
import { createNote } from '../../store/slices/noteSlice';

const CreateNoteModal = () => {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { notebooks } = useSelector((state) => state.notebooks);
  const { currentNotebook } = useSelector((state) => state.notebooks);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    notebook: currentNotebook?._id || '',
    tags: ''
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    dispatch(setModal({ modal: 'createNote', open: false }));
    setFormData({
      title: '',
      content: '',
      notebook: currentNotebook?._id || '',
      tags: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.notebook) {
      newErrors.notebook = 'Notebook is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Transform tags from comma-separated string to array
        const transformedData = {
          ...formData,
          tags: formData.tags
            ? formData.tags.split(',').map((tag) => tag.trim())
            : []
        };

        await dispatch(createNote(transformedData)).unwrap();
        handleClose();
      } catch (error) {
        console.error('Create note error:', error);
        setErrors({
          submit: error.message || 'Failed to create note'
        });
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Dialog
      open={modals.createNote}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Create New Note</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={Boolean(errors.title)}
            helperText={errors.title}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Notebook</InputLabel>
            <Select
              name="notebook"
              value={formData.notebook}
              onChange={handleChange}
              error={Boolean(errors.notebook)}
            >
              {notebooks.map((notebook) => (
                <MenuItem key={notebook._id} value={notebook._id}>
                  {notebook.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Initial Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas"
            helperText="Optional: Add tags to help organize your notes"
          />

          {errors.submit && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errors.submit}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNoteModal;
