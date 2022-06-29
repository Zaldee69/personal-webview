import axios from "axios";
import { TSigningRequestData, TSigningResponseData } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id/";

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
