import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import tableSlice from "./reducers/tableSlice";
import loadingSlice from "./reducers/loadingSlice";
import contentSlice from "./reducers/contentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    table: tableSlice,
    loading: loadingSlice,
    content: contentSlice,
  },
});

export default store;
