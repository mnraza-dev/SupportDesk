
import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';
import type { AppDispatch } from '../../store/index';
import type { Role } from './authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = () => {
    dispatch(login({ email, role }));
    if (role === 'ADMIN' || role === 'AGENT') {
      navigate('/dashboard');
    } else {
      alert('CUSTOMER role not implemented in protected routes yet.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10} textAlign="center">
        <Typography variant="h4" gutterBottom>
          SupportDesk Login
        </Typography>
        <Box mt={4}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Role"
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <MenuItem value="CUSTOMER">Customer</MenuItem>
            <MenuItem value="AGENT">Agent</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Log In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
