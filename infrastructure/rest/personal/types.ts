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
