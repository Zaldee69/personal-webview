import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "../slices/loginSlice";
export const store = configureStore({
  reducer: {
    login : loginSlice,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false
  }).concat(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
