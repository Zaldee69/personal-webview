export type TPersonalResetPasswordRequestData = {
  token: string;
  password: string;
};

export type TPersonalResetPasswordResponseData = {
  success: boolean;
  message: string;
  data: null;
};
