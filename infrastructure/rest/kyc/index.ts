import { setKycCheckstepTokenToLocalStorage } from "@/utils/setKycCheckstepTokenToLocalStorage";
import axios from "axios";
import {
  TKycCheckStepRequestData,
  TKycCheckStepResponseData,
  TKycFinalFormRequestData,
  TKycFinalFormResponseData,
  TKycGenerateActionRequestData,
  TKycGenerateActionResponseData,
  TKycVerificationRequestData,
  TKycVerificationResponseData,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev-register.tilaka.id";

export const RestKycCheckStep = ({
  payload,
}: {
  payload: TKycCheckStepRequestData;
}): Promise<TKycCheckStepResponseData> => {
  return axios
    .post<TKycCheckStepResponseData>(`${BASE_URL}/api/kyc/checkstep`, payload, {
      headers: {},
    })
    .then((res) => {
      setKycCheckstepTokenToLocalStorage(res.data.data?.token || null);
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const RestKycFinalForm = ({
  payload,
}: {
  payload: TKycFinalFormRequestData;
}): Promise<TKycFinalFormResponseData> => {
  return axios
    .post<TKycFinalFormResponseData>(`${BASE_URL}/api/kyc/finalform`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kyc_checkstep_token")}`,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestKycGenerateAction = (
  body: TKycGenerateActionRequestData
): Promise<TKycGenerateActionResponseData> => {
  return axios
    .post<TKycGenerateActionResponseData>(
      `${BASE_URL}/api/kyc/generateaction`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestKycVerification = (
  body: TKycVerificationRequestData
): Promise<TKycVerificationResponseData> => {
  return axios
    .post<TKycVerificationResponseData>(
      `${BASE_URL}/api/kyc/verification`,
      body,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "kyc_checkstep_token"
          )}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
