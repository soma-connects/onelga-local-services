import { createSlice } from '@reduxjs/toolkit';

interface ServicesState {
  activeServices: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  activeServices: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Services-related actions will be implemented later
  },
});

export default servicesSlice.reducer;
