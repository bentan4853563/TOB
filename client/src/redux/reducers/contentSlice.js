import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  contents: {},
};

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    storeContentData: (state, action) => {
      state.contents = action.payload;
    },
    clearContentData: (state) => {
      state.contents = initialState.contents;
    },
  },
});

// Action creators are generated for each case reducer function
export const { storeContentData, clearcontentData } = contentSlice.actions;

export default contentSlice.reducer;
