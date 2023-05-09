import { Status } from "@/interface/interface";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RestThemeConfiguration } from "infrastructure";
import { TThemeResponse } from "infrastructure/rest/personal/types";

export const initialState: TThemeResponse & Status = {
  data: {
    logo: "",
    background: "",
    buttonColor: "",
    actionFontColor: "",
    toastColor: "",
  },
  status: "IDDLE",
};

export const getTheme = createAsyncThunk(
  "personal/theme",
  async ({ uuid, type }: { uuid?: string, type:  "channel_id" | "request_id"  }) => {
    const res = RestThemeConfiguration({uuid, type}).then((res) => res).catch((err) => {throw err});
    return res;
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTheme.pending, (state) => {
      state.status = "PENDING";
    });
    builder.addCase(getTheme.fulfilled, (state, { payload }) => {
      state.status = "FULLFILLED";
      state.data = payload.data
    });
    builder.addCase(getTheme.rejected, (state) => {
      state.status = "REJECTED";
    });
  },
});

export { initialState as intialStateThemeSlice };
export default themeSlice.reducer;
