import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  primary: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#fff'
  },
  secondary: {
    main: '#f50057',
    light: '#ff4081',
    dark: '#c51162',
    contrastText: '#fff'
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#fff'
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#fff'
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)'
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#fff'
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    A400: '#bdbdbd',
    A700: '#616161'
  }
};

// Theme configuration
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em'
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em'
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  mixins: {
    toolbar: {
      minHeight: 64
    }
  }
};

// Light theme
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    ...colors
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

// Dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    ...colors
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.2)',
          backgroundImage: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

// Custom theme components
export const themeComponents = {
  // Sidebar
  sidebar: {
    width: 280,
    collapsedWidth: 72
  },
  // Content
  content: {
    maxWidth: 1200,
    padding: {
      xs: 2,
      sm: 3,
      md: 4
    }
  },
  // Editor
  editor: {
    minHeight: 400,
    toolbar: {
      height: 42
    }
  },
  // Animation durations
  animation: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  }
};
