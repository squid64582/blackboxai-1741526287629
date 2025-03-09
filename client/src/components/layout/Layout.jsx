import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { themeComponents } from '../../theme';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import CreateNotebookModal from '../notebooks/CreateNotebookModal';
import CreateNoteModal from '../notes/CreateNoteModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import ShareNotebookModal from '../notebooks/ShareNotebookModal';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${
              sidebarOpen
                ? themeComponents.sidebar.width
                : themeComponents.sidebar.collapsedWidth
            }px)`
          },
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Header handleDrawerToggle={handleDrawerToggle} />

        {/* Page content */}
        <Box
          sx={{
            flexGrow: 1,
            p: themeComponents.content.padding,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Modals */}
      <CreateNotebookModal />
      <CreateNoteModal />
      <DeleteConfirmationModal />
      <ShareNotebookModal />
    </Box>
  );
};

export default Layout;
