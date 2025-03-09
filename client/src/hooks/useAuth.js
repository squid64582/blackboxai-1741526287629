import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  const requireAuth = (callback) => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (callback) callback();
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    requireAuth
  };
};

export default useAuth;
