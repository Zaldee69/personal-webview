import axios from "axios";
import {
  TSetDefaultSignatureRequestData,
  TSetDefaultSignatureResponseData,
  TSetDefaultMFARequestData
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL || "http://10.117.1.151:8080";


export const restSetDefaultSignature = ({
    payload,
  }: {
    payload: TSetDefaultSignatureRequestData;
  }): Promise<TSetDefaultSignatureResponseData> => {
    return axios
      .post<TSetDefaultSignatureResponseData>(`${BASE_URL}/v1/b2b/integration/user/set/default-signature`, payload, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err;
      });
  };

  export const restSetDefaultMFA = ({
    payload,
  }: {
    payload: TSetDefaultMFARequestData;
  }): Promise<TSetDefaultSignatureResponseData> => {
    return axios
      .post<TSetDefaultSignatureResponseData>(`${BASE_URL}/v1/b2b/integration/user/set/default-mfa`, payload, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err;
      });
  }
