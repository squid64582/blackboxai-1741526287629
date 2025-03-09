import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showAlert } from '../store/slices/uiSlice';
import api from '../utils/api';

export const useApi = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    setError(errorMessage);
    dispatch(showAlert({
      type: 'error',
      message: errorMessage
    }));
  }, [dispatch]);

  const execute = useCallback(async (
    apiCall,
    {
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessAlert = true,
      showErrorAlert = true
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (showSuccessAlert) {
        dispatch(showAlert({
          type: 'success',
          message: successMessage || 'Operation completed successfully'
        }));
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const message = errorMessage || err.response?.data?.message || err.message || 'An error occurred';
      
      if (showErrorAlert) {
        dispatch(showAlert({
          type: 'error',
          message
        }));
      }

      setError(message);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const get = useCallback((url, config = {}) => {
    return execute(() => api.get(url, config), config);
  }, [execute]);

  const post = useCallback((url, data, config = {}) => {
    return execute(() => api.post(url, data, config), config);
  }, [execute]);

  const put = useCallback((url, data, config = {}) => {
    return execute(() => api.put(url, data, config), config);
  }, [execute]);

  const del = useCallback((url, config = {}) => {
    return execute(() => api.delete(url, config), config);
  }, [execute]);

  return {
    loading,
    error,
    execute,
    get,
    post,
    put,
    delete: del,
    setError
  };
};

// Example usage:
/*
const MyComponent = () => {
  const api = useApi();

  const handleSubmit = async () => {
    try {
      const data = await api.post('/endpoint', formData, {
        successMessage: 'Data saved successfully!',
        onSuccess: (response) => {
          // Handle success
        }
      });
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <div>
      {api.loading && <LoadingSpinner />}
      {api.error && <ErrorMessage error={api.error} />}
    </div>
  );
};
*/

export default useApi;
