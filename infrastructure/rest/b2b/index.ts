import axios from "axios";
import {
  TSetDefaultSignatureRequestData,
  TSetDefaultSignatureResponseData,
  TSetDefaultMFARequestData,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id";

export const restSetDefaultSignature = ({
  payload,
}: {
  payload: TSetDefaultSignatureRequestData;
}): Promise<TSetDefaultSignatureResponseData> => {
  return axios
    .post<TSetDefaultSignatureResponseData>(
      `${BASE_URL}/integration/user/set/default-signature`,
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

export const restSetDefaultMFA = ({
  payload,
}: {
  payload: TSetDefaultMFARequestData;
}): Promise<TSetDefaultSignatureResponseData> => {
  return axios
    .post<TSetDefaultSignatureResponseData>(
      `${BASE_URL}/integration/user/set/default-mfa`,
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

export const restGetOtp = ({}: {}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/integration/totp`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const getUserName = ({}: {}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/integration/user/get/default-signature-mfa`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const getCertificateList = ({
  params,
}: {
  params : string
}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/certificate/list?companyId=${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};
