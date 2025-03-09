import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { showAlert } from '../store/slices/uiSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle different error scenarios
    if (response) {
      // Handle unauthorized errors
      if (response.status === 401) {
        store.dispatch(logout());
        store.dispatch(
          showAlert({
            type: 'error',
            message: 'Session expired. Please log in again.'
          })
        );
      }

      // Handle forbidden errors
      else if (response.status === 403) {
        store.dispatch(
          showAlert({
            type: 'error',
            message: 'You do not have permission to perform this action.'
          })
        );
      }

      // Handle not found errors
      else if (response.status === 404) {
        store.dispatch(
          showAlert({
            type: 'error',
            message: 'The requested resource was not found.'
          })
        );
      }

      // Handle validation errors
      else if (response.status === 422) {
        store.dispatch(
          showAlert({
            type: 'error',
            message: response.data.message || 'Validation error occurred.'
          })
        );
      }

      // Handle server errors
      else if (response.status >= 500) {
        store.dispatch(
          showAlert({
            type: 'error',
            message: 'An internal server error occurred. Please try again later.'
          })
        );
      }
    }
    // Handle network errors
    else if (error.request) {
      store.dispatch(
        showAlert({
          type: 'error',
          message: 'Network error. Please check your internet connection.'
        })
      );
    }
    // Handle other errors
    else {
      store.dispatch(
        showAlert({
          type: 'error',
          message: 'An unexpected error occurred.'
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper functions for common API operations
export const apiHelpers = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),

  // Notebooks
  getNotebooks: () => api.get('/notebooks'),
  createNotebook: (data) => api.post('/notebooks', data),
  updateNotebook: (id, data) => api.put(`/notebooks/${id}`, data),
  deleteNotebook: (id) => api.delete(`/notebooks/${id}`),
  getNotebookStats: (id) => api.get(`/notebooks/${id}/stats`),
  addCollaborator: (notebookId, data) => 
    api.post(`/notebooks/${notebookId}/collaborators`, data),
  removeCollaborator: (notebookId, userId) =>
    api.delete(`/notebooks/${notebookId}/collaborators/${userId}`),

  // Notes
  getNotes: (notebookId) => api.get(`/notes/notebook/${notebookId}`),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  getVersionHistory: (id) => api.get(`/notes/${id}/versions`),
  restoreVersion: (noteId, versionId) =>
    api.post(`/notes/${noteId}/versions/${versionId}/restore`),

  // AI Features
  generateSummary: (noteId) => api.post(`/ml/notes/${noteId}/summarize`),
  generateInsights: (noteId) => api.post(`/ml/notes/${noteId}/insights`),
  analyzeNotebook: (notebookId) => api.post(`/ml/notebooks/${notebookId}/analyze`),
  getSuggestions: (noteId) => api.post(`/ml/notes/${noteId}/suggestions`),
  suggestTitle: (noteId) => api.post(`/ml/notes/${noteId}/suggest-title`)
};
