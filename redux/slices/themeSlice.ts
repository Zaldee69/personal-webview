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
    font_family: "",
    font_color: "",
    asset_liveness_guide_1: "",
    asset_liveness_guide_2: "",
    asset_liveness_guide_3: "",
    asset_liveness_action_selfie: "",
    asset_liveness_action_open_mouth: "",
    asset_liveness_action_blink: "",
    asset_liveness_failed: "",
    asset_registration_final_form: "",
    asset_registration_status_success: "",
    asset_registration_status_failed: "",
    asset_activation_login: "",
    asset_activation_cert_confirmation: "",
    asset_activation_cert_error: "",
    asset_activation_setting_signature_and_mfa: "",
    asset_activation_success: "",
    asset_activation_failed: "",
    asset_action_popup_consent: "",
    asset_signing: "",
    asset_signing_success: "",
    asset_signing_failed: "",
    asset_forget_password: "",
    asset_forget_tilaka_name: "",
    asset_manual_form_ektp_ok: "",
    asset_manual_form_ektp_not_ok: "",
    asset_manual_form_selfie_ok: "",
    asset_manual_form_selfie_not_ok: "",
    asset_manual_form_final_form: "",
    asset_liveness_v2_action_selfie: "",
    asset_liveness_v2_action_open_mouth: "",
    asset_liveness_v2_action_blink: "",
    asset_liveness_v2_failed: "",
    asset_liveness_v2_success: "",
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
