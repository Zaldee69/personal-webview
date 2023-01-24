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
  registerId: string
  tilakaName: string
  faceImage: string
}

export type TPersonalFaceRecognitionResponseData = {
  success: boolean
  message: string
}

export type TPersonalCheckStepv2Response = {
  success: boolean
  message: string
  data: {
    token: string
    status: string
    route: string
  }
}