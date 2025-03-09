import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  NoteAdd as NoteAddIcon,
  LibraryBooks as LibraryBooksIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Redux actions
import { toggleSidebar, setModal } from '../../store/slices/uiSlice';
import { themeComponents } from '../../theme';

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { notebooks } = useSelector((state) => state.notebooks);

  const handleCreateNotebook = () => {
    dispatch(setModal({ modal: 'createNotebook', open: true }));
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          p: 1
        }}
      >
        <IconButton onClick={() => dispatch(toggleSidebar())}>
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* Notebooks Section */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          <ListItem
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1
            }}
          >
            <ListItemIcon>
              <LibraryBooksIcon />
            </ListItemIcon>
            <ListItemText primary="Notebooks" />
            {sidebarOpen && (
              <Tooltip title="Create Notebook">
                <IconButton size="small" onClick={handleCreateNotebook}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </ListItem>

          {/* Notebook List */}
          {notebooks.map((notebook) => (
            <ListItem key={notebook._id} disablePadding>
              <ListItemButton
                selected={location.pathname.includes(`/notebooks/${notebook._id}`)}
                onClick={() => navigate(`/notebooks/${notebook._id}`)}
              >
                <ListItemIcon>
                  <NoteAddIcon />
                </ListItemIcon>
                <ListItemText
                  primary={notebook.title}
                  sx={{
                    '& .MuiTypography-root': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Create Notebook Button (Mobile) */}
      {sidebarOpen && (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleCreateNotebook}
          >
            New Notebook
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: sidebarOpen ? themeComponents.sidebar.width : themeComponents.sidebar.collapsedWidth },
        flexShrink: { md: 0 }
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: themeComponents.sidebar.width
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: sidebarOpen ? themeComponents.sidebar.width : themeComponents.sidebar.collapsedWidth,
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden'
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
