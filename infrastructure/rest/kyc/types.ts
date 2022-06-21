export type TKycCheckStepRequestData = {
  registerId: string;
};

export type TKycCheckStepResponseData = {
  success: boolean;
  message: string;
  data: {
    status: string;
    token?: string;
  };
};

export type TKycFinalFormRequestData = {
  registerId: string;
  password: string;
  tilakaName: string;
};

export type TKycFinalFormResponseData = {
  success: boolean;
  message: string;
  data: {
    status: string;
  };
};

export type TKycGenerateActionRequestData = {
  registerId: string
}

export type TKycGenerateActionResponseData = {
  success: boolean;
  message: string;
  data: {
    actionList: string[];
  };
};

export type TKycVerificationRequestData = {
  registerId: string
  mode: string
  image_selfie: string
  image_action1: string
  image_action2: string
  image_action3: string
}

export type TKycVerificationResponseData = {
  success: boolean;
  message: string;
  data: {
    nik: string;
    name: string;
    email: string;
    companyname: string;
    status: string;
  };
};
