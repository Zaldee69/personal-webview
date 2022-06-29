import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "../slices/loginSlice";
import documentSlice from "../slices/documentSlice";
import livenessSlice from "../slices/livenessSlice";
export const store = configureStore({
  reducer: {
    login : loginSlice,
    document : documentSlice,
    liveness: livenessSlice,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false
  }).concat(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
