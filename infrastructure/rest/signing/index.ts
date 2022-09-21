import axios from "axios";
import {
  TSigningRequestData,
  TSigningResponseData,
  TSigningAuthPINRequestData,
  TSigningAuthPINResponseData,
  ISigningDownloadSignedPDFResponseData,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id";

export const restSigning = ({
  payload,
  token = localStorage.getItem("token"),
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
}: {
  payload: TSigningAuthPINRequestData;
}): Promise<TSigningAuthPINResponseData> => {
  return axios
    .post<TSigningAuthPINResponseData>(
      `${BASE_URL}/signing-authpin`,
      {
        pin: payload.pin,
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
  token = localStorage.getItem("token_v2"),
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
