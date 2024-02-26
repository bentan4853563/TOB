import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    clearLoading: (state) => {
      state.loading = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setLoading, clearLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
