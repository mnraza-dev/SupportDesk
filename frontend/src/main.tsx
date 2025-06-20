import React, { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import store from './store/index';
import { ThemeProvider, createTheme, CssBaseline, IconButton } from "@mui/material";
import { Provider } from "react-redux";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  useEffect(() => { localStorage.setItem('themeMode', mode); }, [mode]);
  const theme = useMemo(() => createTheme({
  palette: {
      mode: mode as 'light' | 'dark',
      primary: {
        main: mode === 'dark' ? '#4be8a9' : "#00b87c",
        contrastText: "#fff",
      },
      secondary: {
        main: mode === 'dark' ? '#00b87c' : "#009e6d",
      },
      background: {
        default: mode === 'dark'
          ? 'linear-gradient(135deg, #181c1f 0%, #23272b 100%)'
          : "#e8f5e9",
        paper: mode === 'dark' ? '#23272b' : "#fff",
      },
      text: {
        primary: mode === 'dark' ? '#f6fafb' : '#222',
        secondary: mode === 'dark' ? '#b7ecb7' : '#666',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h4: {
        fontWeight: 700,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0 8px 32px 0 rgba(0,0,0,0.25)'
              : '0 8px 32px 0 rgba(60, 180, 120, 0.10)',
            background: mode === 'dark' ? '#23272b' : '#fff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            color: mode === 'dark' ? '#f6fafb' : undefined,
            background: mode === 'dark' ? '#23272b' : undefined,
            '&:hover': {
              background: mode === 'dark' ? '#2e3237' : undefined,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            background: mode === 'dark' ? '#23272b' : '#fff',
            color: mode === 'dark' ? '#f6fafb' : undefined,
          },
          input: {
            color: mode === 'dark' ? '#f6fafb' : undefined,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#b7ecb7' : undefined,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#f6fafb' : undefined,
            background: mode === 'dark' ? '#23272b' : undefined,
          },
        },
      },
    },
  }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ position: 'fixed', top: 16, right: 24, zIndex: 1300 }}>
        <IconButton onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')} color="inherit" sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </div>
      <div style={{ minHeight: '100vh', background: theme.palette.background.default, transition: 'background 0.3s' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <Provider store={store}>
      <ThemeWrapper>
      <App />
      </ThemeWrapper>
     </Provider>
  </React.StrictMode>
);
