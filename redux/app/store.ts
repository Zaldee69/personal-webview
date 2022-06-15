import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "../slices/loginSlice";
import documentSlice from "../slices/documentSlice";
export const store = configureStore({
  reducer: {
    login : loginSlice,
    document : documentSlice,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false
  }).concat(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
