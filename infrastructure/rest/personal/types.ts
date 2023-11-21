export type TPersonalResetPasswordRequestData = {
  token: string;
  password: string;
};

export type TPersonalResetPasswordResponseData = {
  success: boolean;
  message: string;
  data: string[] | null;
};

export type TPersonalRequestChangePasswordRequestData = {
  request_id: string;
  password: string;
};

export type TPersonalRequestChangePasswordResponseData = {
  success: boolean;
  message: string;
  data: string[] | null;
};

export type TPersonalRequestTilakaNameRequestData = {
  email?: string;
  recaptcha_response?: string;
};

export type TPersonalRequestTilakaNameResponseData = {
  success: boolean;
  message: string;
  data: string[] | null;
};

export type TPersonalRequestResetPasswordRequestData = {
  email?: string;
  recaptcha_response?: string;
};

export type TPersonalRequestResetPasswordResponseData = {
  success: boolean;
  message: string;
  token: string | null;
  user_identifier: string | null;
};

export type TPersonalChangePasswordRequestData = {
  request_id: string;
  password: string;
};

export type TPersonalChangePasswordResponseData = {
  success: boolean;
  message: string;
  data: string[] | null;
};

export type TPersonalSetPasswordRequestData = {
  register_id: string;
  token: string;
  password: string;
  tilaka_name?: string | null;
};

export type TPersonalSetPasswordResponseData = {
  success: boolean;
  message: string;
  data: null;
};

export type TPersonalFaceRecognitionRequestData = {
  registerId: string;
  tilakaName: string;
  faceImage: string;
};

export type TPersonalFaceRecognitionResponseData = {
  success: boolean;
  message: string;
  data: {
    failMfa: number;
  };
};

export type TPersonalCheckStepv2Response = {
  success: boolean;
  message: string;
  data: {
    token: string;
    status: string;
    route: string;
  };
};

export type TPersonalApproveConsentResponse = {
  success: boolean;
  message: string;
  // data: null;
  data: {
    status: string;
    reason: string;
  };
};

export type TPersonalFaceRecognitionRequestDataV2 = {
  face_image: string;
};

export type TPersonalPManualRegRequestData = {
  nik: string;
  name: string;
  email: string;
  register_id: string;
  photo_selfie: string;
  photo_ktp: string;
};

export type TPersonalPManualRegResponseData = {
  success: boolean;
  message: string;
  token: string | null;
  channel_type: string | null;
  tilaka_name: string | null;
};

export type TThemeResponse = {
  data: {
    logo: string;
    background: string;
    button_color: string;
    action_font_color: string;
    toast_color: string;
    font_family: string;
    font_color: string;
    asset_liveness_guide_1: string;
    asset_liveness_guide_2: string;
    asset_liveness_guide_3: string;
    asset_liveness_action_selfie: string;
    asset_liveness_action_open_mouth: string;
    asset_liveness_action_blink: string;
    asset_liveness_failed: string;
    asset_registration_final_form: string;
    asset_registration_status_success: string;
    asset_registration_status_failed: string;
    asset_activation_login: string;
    asset_activation_cert_confirmation: string;
    asset_activation_cert_error: string;
    asset_activation_setting_signature_and_mfa: string;
    asset_activation_success: string;
    asset_activation_failed: string;
    asset_action_popup_consent: string;
    asset_signing: string;
    asset_signing_success: string;
    asset_signing_failed: string;
    asset_forget_password: string;
    asset_forget_tilaka_name: string;
    asset_manual_form_ektp_ok: string;
    asset_manual_form_ektp_not_ok: string;
    asset_manual_form_selfie_ok: string;
    asset_manual_form_selfie_not_ok: string;
    asset_manual_form_final_form: string;
    asset_liveness_v2_action_selfie: string;
    asset_liveness_v2_action_open_mouth: string;
    asset_liveness_v2_action_blink: string;
    asset_liveness_v2_failed: string;
    asset_liveness_v2_success: string;
    asset_forget_password_email_sent: string
    asset_forget_tilaka_name_email_sent: string;
    asset_signing_authenticated_success: string
    asset_forget_password_success: string
  };
};

export type TOTPResponse = {
  success: boolean;
  message: string;
  error: string
  verified: boolean
}