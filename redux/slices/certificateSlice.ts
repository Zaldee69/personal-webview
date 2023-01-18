import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface certificateResponse {
  serialNumber: string;
  nama: string;
  organisasi: string;
  negara: string;
  emailAddress: string;
}

const initialState: any = {
  certificate: {
    serialNumber: "",
    nama: "",
    organisasi: "",
    negara: "",
    emailAddress: "",
  },
};

const certificateSlice = createSlice({
  name: "certificate",
  initialState,
  reducers: {
    setCertificate: (state, action: PayloadAction<certificateResponse>) => {
      state.certificate = action.payload;
    },
  },
});

export const { setCertificate } = certificateSlice.actions;

export { initialState as initialStateCertificateSlice };

export default certificateSlice.reducer;
