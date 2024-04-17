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
    setExclusionData: (state, action) => {
      state.contents = state.contents.map((exclusion) => {
        if (exclusion._id === action.payload._id) {
          return {
            ...exclusion,
            description: action.payload.description,
          };
        }
        return exclusion; // Return the original object for elements that don't match the condition
      });
    },
    clearContentData: (state) => {
      state.contents = initialState.contents;
    },
  },
});

// Action creators are generated for each case reducer function
export const { storeContentData, setExclusionData, clearcontentData } =
  contentSlice.actions;

export default contentSlice.reducer;
