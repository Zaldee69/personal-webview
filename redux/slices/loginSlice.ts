import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TLoginInitialState, TLoginProps } from "./../../interface/interface";
import { login as loginHandler } from "@/utils/auth";

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
    tilaka_name,
    password,
    channel_id,
    request_id,
    remember,
  }: TLoginProps) => {
    const req = loginHandler(
      tilaka_name,
      password,
      channel_id!,
      request_id!,
      (remember = true)
    );
    return req;
  }
);
// tilaka_name: string,
// password: string,
// channel_id: string,
// request_id: string,
// remember: boolean

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
      };
    },
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

export const { resetInitalState } = loginSlice.actions;
export default loginSlice.reducer;
