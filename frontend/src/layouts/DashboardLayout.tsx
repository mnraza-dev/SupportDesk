import { type JSX, useState } from "react";
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar, AppBar, Typography, CssBaseline, Avatar, IconButton } from "@mui/material";
import { useNavigate, Outlet, useLocation, NavLink } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import api from '../services/api';

const drawerWidth = 240;

const adminAgentMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Tickets", path: "/dashboard/tickets", icon: <ConfirmationNumberIcon /> },
  { label: "Agents", path: "/agents", icon: <GroupIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const customerMenuItems = [
  { label: "My Tickets", path: "/dashboard/tickets", icon: <ConfirmationNumberIcon /> },
  { label: "Create Ticket", path: "/dashboard/create-ticket", icon: <AddCircleOutlineIcon /> },
];

export default function DashboardLayout(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatch = useDispatch();

  const menuItems = isCustomer ? customerMenuItems : adminAgentMenuItems;
  const sidebarTitle = isCustomer ? 'SupportDesk Customer' : 'SupportDesk Admin';

  const handleLogout = async () => {
    await api.post('/auth/logout');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, boxShadow: 0, bgcolor: isDark ? '#d2f1e7' : '#f6fafb', color: isDark ? '#111' : '#222' }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" fontWeight={700} color={isDark ? '#111' : '#00b87c'}>
            {sidebarTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 72 : drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? 72 : drawerWidth,
            boxSizing: "border-box",
            bgcolor: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.98)',
            borderRight: 'none',
            boxShadow: '2px 0 16px 0 rgba(60, 180, 120, 0.07)',
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 2,
            transition: 'width 0.2s',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 80, width: '100%', justifyContent: collapsed ? 'center' : 'flex-end', px: 1 }}>
          <IconButton onClick={() => setCollapsed(c => !c)} size="large" sx={{ color: '#00b87c' }}>
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Toolbar>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#00b87c', width: 56, height: 56, mb: 1, boxShadow: 2 }}>
            <SupportAgentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          {!collapsed && (
            <Typography variant="h6" fontWeight={700} color={isDark ? '#111' : '#00b87c'} sx={{ mb: 2, letterSpacing: 1 }}>
              {sidebarTitle}
            </Typography>
          )}
        </Box>
        <List sx={{ width: '100%', px: 1, flex: 1 }}>
          {menuItems.map(({ label, path, icon }) => {
            const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/dashboard');
            return (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  py: 1.5,
                  px: 2,
                  fontWeight: 600,
                  bgcolor: isActive ? '#e0f7fa' : 'transparent',
                  color: isActive ? '#00b87c' : isDark ? '#111' : '#222',
                  boxShadow: isActive ? 2 : 0,
                  transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    bgcolor: '#e0f7fa',
                    color: '#00b87c',
                    boxShadow: 2,
                  },
                }}
              >
                {icon && <Box sx={{ minWidth: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', mr: collapsed ? 0 : 2 }}>{icon}</Box>}
                {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 600 }} />}
              </ListItemButton>
            );
          })}
        </List>
        {/* User Profile Section */}
        <Box sx={{ width: '100%', p: 2, borderTop: '1px solid #e0f7fa', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 2, minHeight: 72 }}>
          <Avatar sx={{ bgcolor: '#009e6d', width: 40, height: 40 }}>
            <PersonIcon />
          </Avatar>
          {!collapsed && user && (
            <Box>
              <Typography variant="body2" fontWeight={700} color={isDark ? '#111' : '#222'}>
                {user.email}
              </Typography>
              <Typography variant="caption" color={isDark ? '#111' : '#888'}>
                {user.role}
              </Typography>
              <Box mt={1}>
                <button onClick={handleLogout} style={{ background: '#00b87c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
