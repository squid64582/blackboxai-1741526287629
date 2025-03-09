import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2
          }}
        >
          {/* 404 Text */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '8rem',
              fontWeight: 700,
              color: theme.palette.primary.main,
              textShadow: `2px 2px 0 ${theme.palette.primary.light}`,
              mb: 2
            }}
          >
            404
          </Typography>

          {/* Error Message */}
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              color: 'text.primary'
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary'
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Back to Home
          </Button>

          {/* Additional Help Text */}
          <Typography
            variant="body2"
            sx={{
              mt: 4,
              color: 'text.secondary'
            }}
          >
            If you believe this is a mistake, please contact support.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
