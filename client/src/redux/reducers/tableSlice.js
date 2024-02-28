import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	metaData: {},
	table: [],
	uploadedFile: null,
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
		setFileName: (state, action) => {
			state.fileName = action.payload;
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
			console.log("Action");
			state.metaData = { ...state.metaData, status: "Review" };
		},
		clearMetaData: (state) => {
			state.metaData = initialState.metaData;
		},
	},
});

// Action creators are generated for each case reducer function
export const {
	setTableData,
	setFileName,
	setUploadedFile,
	setMetaData,
	setReview,
	clearTablData,
	clearFileName,
	clearMetaData,
} = tableSlice.actions;

export default tableSlice.reducer;
