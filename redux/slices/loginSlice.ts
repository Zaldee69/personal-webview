import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TLoginInitialState, TLoginProps } from "./../../interface/interface";
import { API } from "../../config/API";

const initialState: TLoginInitialState = {
  data: {
    data: "",
    message: "",
    success: false,
    nik: "",
  },
  status: "IDDLE",
};

export const login = createAsyncThunk(
  "personal/login",
  async ({
    password,
    request_id,
    tilaka_name,
    channel_id,
    nik,
    company_id,
  }: TLoginProps) => {
    const req = API.post(`/checkPassword`, {
      company_id,
      request_id,
      password,
      tilaka_name,
      channel_id,
      nik,
    });
    return req;
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    resetInitalState: (state) => {
      state.status = "IDDLE";
      state.data = {
        data: "",
        message: "",
        success: false,
        nik: "",
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "PENDING";
      })
      .addCase(login.fulfilled, (state, { payload }: any) => {
        state.status = "FULLFILLED";
        state.data = payload.data;
      })
      .addCase(login.rejected, (state) => {
        state.status = "REJECTED";
      });
  },
});

export { initialState as initialStateLoginSlice };

export const {resetInitalState} = loginSlice.actions
export default loginSlice.reducer;
