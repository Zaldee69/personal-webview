import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/config/API";
import { TDocumentResponse, TDocumentProps } from "@/interface/interface";

const initialState: TDocumentResponse = {
  response: {
    success: "",
    message: false,
    data: {
      document: "",
      mfa: "FR",
      posX: 0,
      posY: 0,
      width: 0,
      height: 0,
      tandaTangan: "",
      page_number: 0
    },
    status: "IDDLE",
  },
};

export const getDocument = createAsyncThunk(
  "personal/document",
  async ({ transaction_id, company_id }: TDocumentProps) => {
    const res = API.post("receiveDocument", {
      transaction_id,
      company_id,
    });
    return res;
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDocument.pending, (state) => {
        state.response.status = "PENDING";
      })
      .addCase(getDocument.fulfilled, (state, { payload }) => {
          state.response = payload.data;
          state.response.status = "FULLFILLED";
      })
      .addCase(getDocument.rejected, (state) => {
        state.response.status = "REJECTED";
      });
  },
});

export default documentSlice.reducer;
