import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';
import type { AppDispatch } from '../../store/index';
import type { Role } from './authSlice';
import { useSnackbar } from '../../App';
import api from '../../services/api';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SVG_IMAGES = [
  '/undraw_real-time-analytics_50za.svg',
];
const floatKeyframes = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-18px); }
  100% { transform: translateY(0px); }
}
`;
const slideInKeyframes = `
@keyframes slideInRight {
  0% { opacity: 0; transform: translateX(80px); }
  100% { opacity: 1; transform: translateX(0); }
}
`;

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % SVG_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: data.email, password: data.password });
      dispatch(login({ email: res.data.user.email, role: res.data.user.role }));
      showSnackbar('Login successful!', 'success');
      if (res.data.user.role === 'ADMIN' || res.data.user.role === 'AGENT') {
        navigate('/dashboard');
      } else if (res.data.user.role === 'CUSTOMER') {
        navigate('/dashboard/create-ticket');
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Login failed', 'error');
      setValue('password', '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: isDark ? '#181c1f' : '#f6fafb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <style>{floatKeyframes + slideInKeyframes}</style>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Login Card */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 420,
            maxWidth: 480,
            width: '100%',
            p: { xs: 2, md: 6 },
            overflow: 'hidden',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              width: '100%',
              minWidth: 420,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: isDark ? '#23272b' : '#fff',
              boxShadow: 'none',
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#00b87c',
                width: 60,
                height: 60,
                mb: 2,
                boxShadow: 'none',
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mb: 0.5, color: isDark ? '#f6fafb' : '#222' }}
            >
              SupportDesk
            </Typography>
            <Typography
              variant="subtitle2"
              color={isDark ? '#b7ecb7' : 'text.secondary'}
              fontWeight={400}
              sx={{ mb: 3, letterSpacing: 0.5 }}
            >
              Sign in to your account
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: '100%' }}
              noValidate
            >
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                autoComplete="email"
                sx={{ mb: 2 }}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting || loading}
              />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                type="password"
                autoComplete="current-password"
                sx={{ mb: 2 }}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isSubmitting || loading}
              />
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #00b87c 30%, #009e6d 100%)',
                  fontWeight: 700,
                  fontSize: 17,
                  py: 1.3,
                  letterSpacing: 1,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #009e6d 30%, #00b87c 100%)',
                  },
                }}
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </Paper>
        </Box>
        {/* Carousel (desktop only) */}
        <Box
          sx={{
            flex: 2.2,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            maxHeight: 600,
            p: 0,
            width: '100%',
            height: '100%',
            m: 0,
            overflow: 'hidden',
            animation: 'slideInRight 1.1s cubic-bezier(.6,-0.01,0,.99)',
            position: 'relative',
          }}
        >
          {/* Carousel arrows hidden */}
          {/*
          <Box ... onClick={handlePrev}>...</Box>
          <Box ... onClick={handleNext}>...</Box>
          */}
          {/* Carousel SVG - full height/width, but constrained */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              maxHeight: 600,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0,
              background: 'transparent',
              boxShadow: 'none',
              p: 0,
              m: 0,
              opacity: 1,
              transition: 'opacity 0.6s, transform 0.6s',
              animation: 'float 3.6s ease-in-out 0s infinite',
              overflow: 'hidden',
              position: 'relative',
            }}
            key={SVG_IMAGES[carouselIndex]}
          >
            <img
              src={SVG_IMAGES[carouselIndex]}
              alt={`Illustration ${carouselIndex + 1}`}
              style={{ width: '100%', height: '100%', maxHeight: '600px', minHeight: '400px', objectFit: 'contain', display: 'block' }}
              draggable={false}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
