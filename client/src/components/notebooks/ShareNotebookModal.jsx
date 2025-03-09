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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

import { setModal } from '../../store/slices/uiSlice';
import { addCollaborator } from '../../store/slices/notebookSlice';

const ShareNotebookModal = () => {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { itemToShare: notebook } = useSelector((state) => state.ui.selectedItems);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');

  const roles = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor' }
  ];

  const handleClose = () => {
    dispatch(setModal({ modal: 'shareNotebook', open: false }));
    setEmail('');
    setRole('viewer');
    setError('');
  };

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await dispatch(
        addCollaborator({
          notebookId: notebook._id,
          email,
          role
        })
      ).unwrap();
      
      setEmail('');
      setError('');
    } catch (error) {
      setError(error.message || 'Failed to share notebook');
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      // Implementation for removing collaborator would go here
      // You would need to create a new action in the notebookSlice
      console.log('Remove collaborator:', collaboratorId);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  if (!notebook) return null;

  return (
    <Dialog
      open={modals.shareNotebook}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Share Notebook</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {notebook.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add people
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={error}
            />
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          People with access
        </Typography>
        <List>
          {/* Owner */}
          <ListItem>
            <ListItemText
              primary={notebook.owner.email}
              secondary={
                <Chip
                  label="Owner"
                  size="small"
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              }
            />
          </ListItem>

          {/* Collaborators */}
          {notebook.collaborators?.map((collaborator) => (
            <ListItem key={collaborator._id}>
              <ListItemText
                primary={collaborator.email}
                secondary={
                  <Chip
                    label={collaborator.role}
                    size="small"
                    color="default"
                    sx={{ mt: 0.5 }}
                  />
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveCollaborator(collaborator._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareNotebookModal;
