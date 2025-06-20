import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { CircularProgress, Box } from '@mui/material';

export default function PublicRoute() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        if (res.data && res.data.user && res.data.user.email && res.data.user.role) {
          dispatch(login({ email: res.data.user.email, role: res.data.user.role }));
          navigate('/dashboard', { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [dispatch, navigate]);

  if (checking) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><CircularProgress /></Box>;
  }

  return <Outlet />;
} 