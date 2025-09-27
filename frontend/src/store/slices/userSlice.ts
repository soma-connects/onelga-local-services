import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // User-related actions will be implemented later
  },
});

export default userSlice.reducer;
