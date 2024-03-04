import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  metaData: {},
  table: [],
  uploadedFile: "",
};

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableData: (state, action) => {
      state.table = action.payload;
    },
    clearTablData: (state) => {
      state.table = initialState.table;
    },
    setUploadedFile: (state, action) => {
      console.log(action.payload);
      state.uploadedFile = action.payload;
    },
    clearFileName: (state) => {
      state.fileName = initialState.fileName;
    },
    setMetaData: (state, action) => {
      state.metaData = action.payload;
    },
    setReview: (state) => {
      state.metaData.status = "Review";
    },
    clearMetaData: (state) => {
      state.metaData = initialState.metaData;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setTableData,
  setUploadedFile,
  setMetaData,
  setReview,
  clearTablData,
  clearFileName,
  clearMetaData,
} = tableSlice.actions;

export default tableSlice.reducer;
