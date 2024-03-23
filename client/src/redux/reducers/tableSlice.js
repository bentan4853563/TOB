import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  metaData: {},
  table: {},
  uploadedFile: "",
  uuid: "",
};

export const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    storeTableData: (state, action) => {
      console.log(action.payload);
      state.table = action.payload;
    },
    clearTableData: (state) => {
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
    setUUID: (state, action) => {
      state.uuid = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  storeTableData,
  setUploadedFile,
  setMetaData,
  setReview,
  clearTableData,
  clearFileName,
  clearMetaData,
  setUUID,
} = tableSlice.actions;

export default tableSlice.reducer;
