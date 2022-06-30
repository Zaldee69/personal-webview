import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "../slices/loginSlice";
import certificateSlice from "../slices/certificateSlice";
import documentSlice from "../slices/documentSlice";
import signatureSlice from "../slices/signatureSlice";
import livenessSlice from "../slices/livenessSlice";
export const store = configureStore({
  reducer: {
    login : loginSlice,
    document : documentSlice,
<<<<<<< HEAD
    certificate: certificateSlice,
=======
    signature : signatureSlice,
>>>>>>> 52ac1e7411f2b24baa1f7bfc250bb7d5514760f5
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
