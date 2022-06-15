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
