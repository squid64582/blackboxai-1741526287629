import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Tooltip,
  Chip,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  NoteAdd as NoteAddIcon,
  Share as ShareIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { fetchNotebooks } from '../store/slices/notebookSlice';
import { setModal, setSelectedItem } from '../store/slices/uiSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notebooks, loading, error } = useSelector((state) => state.notebooks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchNotebooks());
  }, [dispatch]);

  const handleCreateNotebook = () => {
    dispatch(setModal({ modal: 'createNotebook', open: true }));
  };

  const handleCreateNote = (notebookId) => {
    dispatch(setSelectedItem({ type: 'notebookToAddNote', item: notebookId }));
    dispatch(setModal({ modal: 'createNote', open: true }));
  };

  const handleShareNotebook = (e, notebook) => {
    e.stopPropagation();
    dispatch(setSelectedItem({ type: 'itemToShare', item: notebook }));
    dispatch(setModal({ modal: 'shareNotebook', open: true }));
  };

  const handleDeleteNotebook = (e, notebook) => {
    e.stopPropagation();
    dispatch(setSelectedItem({ type: 'notebookToDelete', item: notebook }));
    dispatch(setModal({ modal: 'deleteConfirmation', open: true }));
  };

  const getNotebookColor = (category) => {
    const colors = {
      personal: '#2196f3',
      work: '#f50057',
      study: '#4caf50',
      project: '#ff9800',
      other: '#9c27b0'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading notebooks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your notebooks and notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNotebook}
          sx={{ mt: 2 }}
        >
          Create New Notebook
        </Button>
      </Box>

      {/* Notebooks Grid */}
      <Grid container spacing={3}>
        {notebooks.map((notebook) => (
          <Grid item xs={12} sm={6} md={4} key={notebook._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/notebooks/${notebook._id}`)}
                sx={{ flexGrow: 1 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}
                  >
                    <Typography variant="h6" component="div" noWrap>
                      {notebook.title}
                    </Typography>
                    <Chip
                      label={notebook.category}
                      size="small"
                      sx={{
                        backgroundColor: getNotebookColor(notebook.category),
                        color: 'white'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {notebook.description || 'No description'}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {notebook.notes?.length || 0} notes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last updated:{' '}
                      {new Date(notebook.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>

              {/* Action Buttons */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '.MuiCard-root:hover &': {
                    opacity: 1
                  }
                }}
              >
                <Tooltip title="Add Note">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNote(notebook._id);
                    }}
                  >
                    <NoteAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton
                    size="small"
                    onClick={(e) => handleShareNotebook(e, notebook)}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteNotebook(e, notebook)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}

        {notebooks.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                bgcolor: 'background.paper',
                borderRadius: 1
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notebooks yet
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create your first notebook to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNotebook}
                sx={{ mt: 2 }}
              >
                Create Notebook
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
