import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import store from './store/index';
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
const theme = createTheme({
  palette: {
    mode: "light",
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <Provider store={store}>

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
     </Provider>

  </React.StrictMode>
);
