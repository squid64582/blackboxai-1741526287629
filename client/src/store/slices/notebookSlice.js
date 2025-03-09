import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to set auth header
const setAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Async thunks
export const fetchNotebooks = createAsyncThunk(
  'notebooks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notebooks`, setAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createNotebook = createAsyncThunk(
  'notebooks/create',
  async (notebookData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/notebooks`, notebookData, setAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateNotebook = createAsyncThunk(
  'notebooks/update',
  async ({ id, notebookData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/notebooks/${id}`, notebookData, setAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteNotebook = createAsyncThunk(
  'notebooks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/notebooks/${id}`, setAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getNotebookStats = createAsyncThunk(
  'notebooks/getStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notebooks/${id}/stats`, setAuthHeader());
      return { id, stats: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addCollaborator = createAsyncThunk(
  'notebooks/addCollaborator',
  async ({ notebookId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/notebooks/${notebookId}/collaborators`,
        { userId, role },
        setAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  notebooks: [],
  currentNotebook: null,
  loading: false,
  error: null,
  stats: {}
};

const notebookSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {
    setCurrentNotebook: (state, action) => {
      state.currentNotebook = action.payload;
    },
    clearNotebookError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notebooks
      .addCase(fetchNotebooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.loading = false;
        state.notebooks = action.payload;
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notebooks';
      })
      // Create notebook
      .addCase(createNotebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotebook.fulfilled, (state, action) => {
        state.loading = false;
        state.notebooks.push(action.payload);
      })
      .addCase(createNotebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create notebook';
      })
      // Update notebook
      .addCase(updateNotebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotebook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notebooks.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notebooks[index] = action.payload;
        }
        if (state.currentNotebook?._id === action.payload._id) {
          state.currentNotebook = action.payload;
        }
      })
      .addCase(updateNotebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update notebook';
      })
      // Delete notebook
      .addCase(deleteNotebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotebook.fulfilled, (state, action) => {
        state.loading = false;
        state.notebooks = state.notebooks.filter(n => n._id !== action.payload);
        if (state.currentNotebook?._id === action.payload) {
          state.currentNotebook = null;
        }
      })
      .addCase(deleteNotebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete notebook';
      })
      // Get notebook stats
      .addCase(getNotebookStats.fulfilled, (state, action) => {
        state.stats[action.payload.id] = action.payload.stats;
      })
      // Add collaborator
      .addCase(addCollaborator.fulfilled, (state, action) => {
        const index = state.notebooks.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notebooks[index] = action.payload;
        }
        if (state.currentNotebook?._id === action.payload._id) {
          state.currentNotebook = action.payload;
        }
      });
  }
});

export const { setCurrentNotebook, clearNotebookError } = notebookSlice.actions;

export default notebookSlice.reducer;
