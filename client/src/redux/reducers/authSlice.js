import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: sessionStorage.getItem("token"),
  isAuthenticated: !!sessionStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      console.log(action.payload);
      sessionStorage.setItem("token", action.payload.token);
      state.isAuthenticated = true;
      state.token = action.payload.token;
    },
    logout: (state) => {
      sessionStorage.clear();
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
