import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: Role;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; role: Role }>) => {
      state.isAuthenticated = true;
      state.user = { email: action.payload.email, role: action.payload.role };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
