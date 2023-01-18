import { createSlice } from "@reduxjs/toolkit";

const initialState: {
  data: {
    scratch: string;
    font: string;
  };
} = {
  data: {
    scratch: "",
    font: "",
  },
};

const signatureSlice = createSlice({
  name: "signature",
  initialState,
  reducers: {
    addScratch(state, { payload }) {
      state.data.scratch = payload;
    },
    addFont(state, { payload }) {
      state.data.font = payload;
    },
    removeSignature(state) {
      state.data.scratch = "";
      state.data.font = "";
    },
  },
});

export const { addScratch, removeSignature, addFont } = signatureSlice.actions;

export { initialState as initialStateSignatureSlice };

export default signatureSlice.reducer;
