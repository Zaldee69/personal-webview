import { configureStore } from "@reduxjs/toolkit";
import loginSlice, { initialStateLoginSlice } from "../slices/loginSlice";
import certificateSlice, {
  initialStateCertificateSlice,
} from "../slices/certificateSlice";
import documentSlice, {
  initialStateDocumentSlice,
} from "../slices/documentSlice";
import signatureSlice, {
  initialStateSignatureSlice,
} from "../slices/signatureSlice";
import livenessSlice, {
  initialStateLivenessSlice,
} from "../slices/livenessSlice";
import themeSlice, { intialStateThemeSlice } from "../slices/themeSlice";

export const store = configureStore({
  reducer: {
    login: loginSlice,
    document: documentSlice,
    certificate: certificateSlice,
    signature: signatureSlice,
    liveness: livenessSlice,
    theme: themeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(),
  preloadedState: {
    certificate: initialStateCertificateSlice,
    document: initialStateDocumentSlice,
    liveness: initialStateLivenessSlice,
    login: initialStateLoginSlice,
    theme: intialStateThemeSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
