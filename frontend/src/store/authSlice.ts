import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  user: any;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
    // Add other auth reducers as needed
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
