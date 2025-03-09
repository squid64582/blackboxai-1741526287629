import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Popper,
  Fade,
  ClickAwayListener
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as NoteIcon,
  LibraryBooks as NotebookIcon
} from '@mui/icons-material';
import { apiHelpers } from '../../utils/api';
import { setSearchQuery, setSearchResults, setSearching } from '../../store/slices/uiSlice';

const SearchBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        dispatch(setSearching(true));
        try {
          // In a real app, you would have a search endpoint
          // This is a simplified example
          const notebooksRes = await apiHelpers.getNotebooks();
          const notebooks = notebooksRes.data.filter(nb => 
            nb.title.toLowerCase().includes(query.toLowerCase())
          );

          const allNotes = [];
          for (const notebook of notebooks) {
            const notesRes = await apiHelpers.getNotes(notebook._id);
            allNotes.push(...notesRes.data);
          }

          const notes = allNotes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
          );

          const searchResults = [
            ...notebooks.map(nb => ({ ...nb, type: 'notebook' })),
            ...notes.map(note => ({ ...note, type: 'note' }))
          ];

          setResults(searchResults);
          dispatch(setSearchResults(searchResults));
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
          dispatch(setSearching(false));
        }
      } else {
        setResults([]);
        dispatch(setSearchResults([]));
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, dispatch]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    dispatch(setSearchQuery(value));
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    dispatch(setSearchQuery(''));
    dispatch(setSearchResults([]));
  };

  const handleResultClick = (result) => {
    if (result.type === 'notebook') {
      navigate(`/notebooks/${result._id}`);
    } else {
      navigate(`/notebooks/${result.notebook}/notes/${result._id}`);
    }
    handleClear();
  };

  const open = Boolean(anchorEl) && query.trim() !== '';

  return (
    <ClickAwayListener onClickAway={handleClear}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
        <TextField
          fullWidth
          value={query}
          onChange={handleSearchChange}
          placeholder="Search notes and notebooks..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={3} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">Searching...</Typography>
                  </Box>
                ) : results.length > 0 ? (
                  <List>
                    {results.map((result) => (
                      <ListItem
                        key={`${result.type}-${result._id}`}
                        button
                        onClick={() => handleResultClick(result)}
                      >
                        <ListItemIcon>
                          {result.type === 'notebook' ? (
                            <NotebookIcon />
                          ) : (
                            <NoteIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.title}
                          secondary={result.type === 'note' ? 'Note' : 'Notebook'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No results found
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
