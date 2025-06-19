import { ReactNode, type JSX } from "react";
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar, AppBar, Typography, CssBaseline } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tickets", path: "/tickets" },
  { label: "Agents", path: "/agents" },
  { label: "Settings", path: "/settings" },
];

export default function DashboardLayout(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            SupportDesk Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map(({ label, path }) => (
            <ListItemButton key={path} onClick={() => navigate(path)}>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
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
