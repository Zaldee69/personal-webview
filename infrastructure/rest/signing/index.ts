import { getStorageWithExpiresIn } from "@/utils/localStorageWithExpiresIn";
import axios from "axios";
import {
  TSigningRequestData,
  TSigningResponseData,
  TSigningAuthPINRequestData,
  TSigningAuthPINResponseData,
  ISigningDownloadSignedPDFResponseData,
  ISigningAuthhashsignResponseData,
  ISigningAuthhashsignRequestData,
} from "./types";
import CORE_API from "@/config/API";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL;

export const restSigning = ({
  payload,
  token = getStorageWithExpiresIn("token"),
}: {
  payload: TSigningRequestData;
  token?: string | null;
}): Promise<TSigningResponseData> => {
  return axios
    .post<TSigningResponseData>(`${BASE_URL}/sign-pdf`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
export const RestSigningAuthPIN = ({
  payload,
  token,
}: {
  payload: TSigningAuthPINRequestData;
  token?: string | null;
}): Promise<TSigningAuthPINResponseData> => {
  const isAsync = payload.async === "true";
  return CORE_API.post<TSigningAuthPINResponseData>(
    `${isAsync ? "v2/" : ""}signing-authpin`,
    {
      pin: payload.pin,
      otp_pin: payload.otp_pin,
      face_image: payload.face_image,
    },
    {
      params: {
        user: payload.user,
        id: payload.id,
      },
    }
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestSigningDownloadSignedPDF = ({
  request_id,
  token = getStorageWithExpiresIn("token_v2"),
}: {
  request_id: string;
  token?: string | null;
}): Promise<ISigningDownloadSignedPDFResponseData> => {
  return CORE_API
    .post<ISigningDownloadSignedPDFResponseData>(`/signing-downloadsignedpdf`, {
      request_id,
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestSigningAuthhashsign = ({
  params,
  payload,
}: {
  params: ISigningAuthhashsignRequestData["params"];
  payload: ISigningAuthhashsignRequestData["payload"];
}): Promise<ISigningAuthhashsignResponseData> => {
  return CORE_API.post<ISigningAuthhashsignResponseData>(
    `/signing-authhashsign`,
    payload,
    {
      params,
    }
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
