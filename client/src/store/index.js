import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notebookReducer from './slices/notebookSlice';
import noteReducer from './slices/noteSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notebooks: notebookReducer,
    notes: noteReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setCredentials'],
      },
    }),
});

export default store;
