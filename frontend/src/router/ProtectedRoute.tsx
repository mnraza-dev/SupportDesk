import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import api from '../services/api';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      api.get('/auth/me')
        .then(res => {
          if (res.data && res.data.user && res.data.user.email && res.data.user.role) {
            dispatch(login({ email: res.data.user.email, role: res.data.user.role }));
          }
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, dispatch]);

  if (checking) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><CircularProgress /></Box>;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}