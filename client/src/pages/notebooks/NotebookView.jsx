import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';

import { fetchNotes } from '../../store/slices/noteSlice';
import { setModal, setSelectedItem } from '../../store/slices/uiSlice';
import { getNotebookStats } from '../../store/slices/notebookSlice';

const NotebookView = () => {
  const { notebookId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentNotebook } = useSelector((state) => state.notebooks);
  const { notes, loading, error } = useSelector((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (notebookId) {
      dispatch(fetchNotes(notebookId));
      dispatch(getNotebookStats(notebookId));
    }
  }, [dispatch, notebookId]);

  const handleCreateNote = () => {
    dispatch(setSelectedItem({ type: 'notebookToAddNote', item: notebookId }));
    dispatch(setModal({ modal: 'createNote', open: true }));
  };

  const handleShareNotebook = () => {
    dispatch(setSelectedItem({ type: 'itemToShare', item: currentNotebook }));
    dispatch(setModal({ modal: 'shareNotebook', open: true }));
  };

  const handleDeleteNotebook = () => {
    dispatch(setSelectedItem({ type: 'notebookToDelete', item: currentNotebook }));
    dispatch(setModal({ modal: 'deleteConfirmation', open: true }));
  };

  const handleDeleteNote = (note) => {
    dispatch(setSelectedItem({ type: 'noteToDelete', item: note }));
    dispatch(setModal({ modal: 'deleteConfirmation', open: true }));
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    handleSortClose();
  };

  const filteredAndSortedNotes = notes
    .filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'title') {
        return order * a.title.localeCompare(b.title);
      }
      return order * (new Date(a[sortBy]) - new Date(b[sortBy]));
    });

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading notes...</Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {currentNotebook?.title}
          </Typography>
          <Box>
            <Tooltip title="Share Notebook">
              <IconButton onClick={handleShareNotebook}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Notebook">
              <IconButton onClick={handleDeleteNotebook} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          {currentNotebook?.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Chip
            label={currentNotebook?.category}
            color="primary"
            size="small"
          />
          <Chip
            label={`${notes.length} notes`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Actions Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNote}
          >
            New Note
          </Button>

          <TextField
            size="small"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Tooltip title="Sort">
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            <MenuItem onClick={() => handleSort('updatedAt')}>
              Last Updated {sortBy === 'updatedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('createdAt')}>
              Date Created {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('title')}>
              Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Notes Grid */}
      <Grid container spacing={3}>
        {filteredAndSortedNotes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note._id}>
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
                onClick={() => navigate(`/notebooks/${notebookId}/notes/${note._id}`)}
                sx={{ flexGrow: 1 }}
              >
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {note.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {note.content.replace(/<[^>]*>/g, '')}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(note.updatedAt).toLocaleDateString()}
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
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '.MuiCard-root:hover &': {
                    opacity: 1
                  }
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}

        {filteredAndSortedNotes.length === 0 && (
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
                No notes found
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Create your first note to get started'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNote}
                  sx={{ mt: 2 }}
                >
                  Create Note
                </Button>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default NotebookView;
