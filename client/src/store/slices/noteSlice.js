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
export const fetchNotes = createAsyncThunk(
  'notes/fetchByNotebook',
  async (notebookId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/notes/notebook/${notebookId}`,
        setAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/notes`,
        noteData,
        setAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, noteData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/notes/${id}`,
        noteData,
        setAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, setAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getVersionHistory = createAsyncThunk(
  'notes/getVersionHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/notes/${id}/versions`,
        setAuthHeader()
      );
      return { id, versions: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const restoreVersion = createAsyncThunk(
  'notes/restoreVersion',
  async ({ noteId, versionId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/notes/${noteId}/versions/${versionId}/restore`,
        {},
        setAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generateAISummary = createAsyncThunk(
  'notes/generateSummary',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/ml/notes/${id}/summarize`,
        {},
        setAuthHeader()
      );
      return { id, summary: response.data.data.summary };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generateAIInsights = createAsyncThunk(
  'notes/generateInsights',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/ml/notes/${id}/insights`,
        {},
        setAuthHeader()
      );
      return { id, insights: response.data.data.insights };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  versionHistory: {},
  aiFeatures: {
    summaries: {},
    insights: {}
  }
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    },
    clearNoteError: (state) => {
      state.error = null;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.currentNote = null;
      state.versionHistory = {};
      state.aiFeatures = {
        summaries: {},
        insights: {}
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notes';
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.push(action.payload);
        state.currentNote = action.payload;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create note';
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notes.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update note';
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = state.notes.filter(n => n._id !== action.payload);
        if (state.currentNote?._id === action.payload) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete note';
      })
      // Version history
      .addCase(getVersionHistory.fulfilled, (state, action) => {
        state.versionHistory[action.payload.id] = action.payload.versions;
      })
      .addCase(restoreVersion.fulfilled, (state, action) => {
        const index = state.notes.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      })
      // AI features
      .addCase(generateAISummary.fulfilled, (state, action) => {
        state.aiFeatures.summaries[action.payload.id] = action.payload.summary;
      })
      .addCase(generateAIInsights.fulfilled, (state, action) => {
        state.aiFeatures.insights[action.payload.id] = action.payload.insights;
      });
  }
});

export const { setCurrentNote, clearNoteError, clearNotes } = noteSlice.actions;

export default noteSlice.reducer;
