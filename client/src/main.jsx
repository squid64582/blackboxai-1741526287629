import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material/styles';
import store from './store';
import App from './App';

// Import global styles
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>
);
