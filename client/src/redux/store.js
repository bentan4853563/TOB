import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import tableSlice from "./reducers/tableSlice";
import loadingSlice from "./reducers/loadingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    table: tableSlice,
    loading: loadingSlice,
  },
});

export default store;
