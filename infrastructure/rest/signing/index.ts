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

const BASE_URL =
  process.env.NEXT_PUBLIC_DS_API_URL || "http://10.117.1.151:8080";

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
  return axios
    .post<TSigningAuthPINResponseData>(
      `${BASE_URL}/${isAsync ? "v2/" : ""}signing-authpin`,
      {
        pin: payload.pin,
        otp_pin: payload.otp_pin,
        face_image: payload.face_image,
      },
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
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
  return axios
    .post<ISigningDownloadSignedPDFResponseData>(
      `${BASE_URL}/signing-downloadsignedpdf`,
      {
        request_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestSigningAuthhashsign = ({
  params,
  payload,
  token = getStorageWithExpiresIn("token_hashsign"),
}: {
  params: ISigningAuthhashsignRequestData["params"];
  payload: ISigningAuthhashsignRequestData["payload"];
  token?: string | null;
}): Promise<ISigningAuthhashsignResponseData> => {
  return axios
    .post<ISigningAuthhashsignResponseData>(
      `${BASE_URL}/signing/authhashsign`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
