import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: true,
  modals: {
    createNotebook: false,
    createNote: false,
    deleteConfirmation: false,
    shareNotebook: false,
    versionHistory: false,
    aiInsights: false
  },
  alert: {
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info'
    message: '',
    duration: 3000 // milliseconds
  },
  selectedItems: {
    notebookToDelete: null,
    noteToDelete: null,
    itemToShare: null
  },
  search: {
    query: '',
    isSearching: false,
    results: []
  },
  editor: {
    isDirty: false,
    autoSave: true,
    fullscreen: false
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setModal: (state, action) => {
      const { modal, open } = action.payload;
      state.modals[modal] = open;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    showAlert: (state, action) => {
      state.alert = {
        show: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 3000
      };
    },
    hideAlert: (state) => {
      state.alert.show = false;
    },
    setSelectedItem: (state, action) => {
      const { type, item } = action.payload;
      state.selectedItems[type] = item;
    },
    clearSelectedItems: (state) => {
      Object.keys(state.selectedItems).forEach(key => {
        state.selectedItems[key] = null;
      });
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
      state.search.isSearching = false;
    },
    setSearching: (state, action) => {
      state.search.isSearching = action.payload;
    },
    clearSearch: (state) => {
      state.search = {
        query: '',
        isSearching: false,
        results: []
      };
    },
    setEditorState: (state, action) => {
      state.editor = {
        ...state.editor,
        ...action.payload
      };
    },
    toggleEditorFullscreen: (state) => {
      state.editor.fullscreen = !state.editor.fullscreen;
    },
    toggleAutoSave: (state) => {
      state.editor.autoSave = !state.editor.autoSave;
    }
  }
});

export const {
  toggleTheme,
  toggleSidebar,
  setModal,
  closeAllModals,
  showAlert,
  hideAlert,
  setSelectedItem,
  clearSelectedItems,
  setSearchQuery,
  setSearchResults,
  setSearching,
  clearSearch,
  setEditorState,
  toggleEditorFullscreen,
  toggleAutoSave
} = uiSlice.actions;

export default uiSlice.reducer;
