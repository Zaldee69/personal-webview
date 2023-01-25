import { setPersonalChangePasswordTokenToLocalStorage } from "@/utils/setPersonalChangePasswordTokenToLocalStorage";
import axios from "axios";
import {
  TPersonalChangePasswordRequestData,
  TPersonalChangePasswordResponseData,
  TPersonalRequestChangePasswordRequestData,
  TPersonalRequestChangePasswordResponseData,
  TPersonalResetPasswordRequestData,
  TPersonalResetPasswordResponseData,
  TPersonalSetPasswordRequestData,
  TPersonalSetPasswordResponseData,
  TPersonalFaceRecognitionRequestData,
  TPersonalFaceRecognitionResponseData,
  TPersonalCheckStepv2Response,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_PERSONAL_API_URL || "https://dev-api.tilaka.id";

export const RestPersonalResetPassword = ({
  payload,
}: {
  payload: TPersonalResetPasswordRequestData;
}): Promise<TPersonalResetPasswordResponseData> => {
  return axios
    .post<TPersonalResetPasswordResponseData>(
      `${BASE_URL}/resetPassword`,
      payload
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalRequestChangePassword = ({
  payload,
}: {
  payload: TPersonalRequestChangePasswordRequestData;
}): Promise<TPersonalRequestChangePasswordResponseData> => {
  return axios
    .post<TPersonalRequestChangePasswordResponseData>(
      `${BASE_URL}/requestChangePassword`,
      payload
    )
    .then((res) => {
      setPersonalChangePasswordTokenToLocalStorage(res.data.data?.[0] || null);
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalChangePassword = ({
  payload,
}: {
  payload: TPersonalChangePasswordRequestData;
}): Promise<TPersonalChangePasswordResponseData> => {
  return axios
    .post<TPersonalChangePasswordResponseData>(
      `${BASE_URL}/changePassword`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "personal_change_password_token"
          )}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalSetPassword = ({
  payload,
}: {
  payload: TPersonalSetPasswordRequestData;
}): Promise<TPersonalSetPasswordResponseData> => {
  return axios
    .post<TPersonalSetPasswordResponseData>(`${BASE_URL}/setPassword`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalFaceRecognition = ({
  payload,
}: {
  payload: TPersonalFaceRecognitionRequestData;
}): Promise<TPersonalFaceRecognitionResponseData> => {
  return axios
    .post<TPersonalSetPasswordResponseData>(
      `${BASE_URL}/face-verification`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "token"
          )}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestKycCheckStepv2 = ({
  registerId,
}: {
  registerId: string;
}): Promise<TPersonalCheckStepv2Response> => {
  return axios
    .post<TPersonalCheckStepv2Response>(
      `${BASE_URL}/checkstep`,
      { registerId },
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
