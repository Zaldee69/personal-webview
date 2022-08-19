import axios from "axios";
import { TSigningRequestData, TSigningResponseData, TSigningAuthPINRequestData, TSigningAuthPINResponseData } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id";

export const restSigning = ({
  payload,
}: {
  payload: TSigningRequestData;
}): Promise<TSigningResponseData> => {
  return axios
    .post<TSigningResponseData>(
      `${BASE_URL}/sign-pdf`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
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
  return axios.post<TSigningAuthPINResponseData>(
    `${BASE_URL}/signing/authpin`,
    {
      pin: payload.pin
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
  })
} 
