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
import { createNotebook } from '../../store/slices/notebookSlice';

const CreateNotebookModal = () => {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    color: '#2196f3'
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'study', label: 'Study' },
    { value: 'project', label: 'Project' },
    { value: 'other', label: 'Other' }
  ];

  const colors = [
    { value: '#2196f3', label: 'Blue' },
    { value: '#4caf50', label: 'Green' },
    { value: '#f44336', label: 'Red' },
    { value: '#ff9800', label: 'Orange' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#795548', label: 'Brown' },
    { value: '#607d8b', label: 'Grey' }
  ];

  const handleClose = () => {
    dispatch(setModal({ modal: 'createNotebook', open: false }));
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      color: '#2196f3'
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await dispatch(createNotebook(formData)).unwrap();
        handleClose();
      } catch (error) {
        console.error('Create notebook error:', error);
        setErrors({
          submit: error.message || 'Failed to create notebook'
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
      open={modals.createNotebook}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Create New Notebook</Typography>
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

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={Boolean(errors.category)}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              name="color"
              value={formData.color}
              onChange={handleChange}
            >
              {colors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: color.value
                      }}
                    />
                    {color.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

export default CreateNotebookModal;
