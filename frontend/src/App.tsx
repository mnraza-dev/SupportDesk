import React, { createContext, useContext, useState, ReactNode } from "react";
import AppRouter from "./router/AppRouter";
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const SnackbarContext = createContext<SnackbarContextType>({ showSnackbar: () => {} });

export function useSnackbar() {
  return useContext(SnackbarContext);
}

function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const showSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Optionally log error to an error reporting service
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h4" color="error" gutterBottom>Something went wrong.</Typography>
          <Typography color="text.secondary" mb={2}>{this.state.error?.message || 'An unexpected error occurred.'}</Typography>
          <Button variant="contained" color="primary" onClick={this.handleReload}>Reload Page</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <SnackbarProvider>
        <AppRouter />
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
