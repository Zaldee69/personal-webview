import { getStorageWithExpiresIn } from "@/utils/localStorageWithExpiresIn";
import axios from "axios";
import {
  TSetDefaultSignatureRequestData,
  TSetDefaultSignatureResponseData,
  TSetDefaultMFARequestData,
  TConfirmCertificateRequestData,
  TConfirmCertificateResponseData,
  TGetRegisteredCertificateRequestData,
  TGetRegisteredCertificateResponseData,
} from "./types";
import CORE_API from "@/config/API";

const BASE_URL =
  process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id";

export const restSetDefaultSignature = ({
  payload,
}: {
  payload: TSetDefaultSignatureRequestData;
  token?: string | null;
}): Promise<TSetDefaultSignatureResponseData> => {
  return CORE_API.post<TSetDefaultSignatureResponseData>(
    `/default-signature`,
    payload
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const restSetDefaultMFA = ({
  payload,
  token = getStorageWithExpiresIn("token"),
}: {
  payload: TSetDefaultMFARequestData;
  token?: string | null;
}): Promise<TSetDefaultSignatureResponseData> => {
  return CORE_API.post<TSetDefaultSignatureResponseData>(
    `/default-mfa`,
    payload
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestConfirmCertificate = (
  body: TConfirmCertificateRequestData,
  token?: string | null
): Promise<TConfirmCertificateResponseData> => {
  return axios
    .post<TConfirmCertificateResponseData>(`${BASE_URL}/confirm`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestRegisteredCertificate = (
  body: TGetRegisteredCertificateRequestData,
  token?: string | null
): Promise<TGetRegisteredCertificateResponseData> => {
  return CORE_API.get<TGetRegisteredCertificateResponseData>(
    `/registered?companyid=${body.company_id}`
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const restGetOtp = (): Promise<any> => {
  return CORE_API.get(`/totp`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const getUserName = (): Promise<any> => {
  return CORE_API.get(`/default-signature-mfa`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const getCertificateList = (): Promise<any> => {
  return CORE_API.get(`/certificationlist`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const restLogout = ({
  token = localStorage.getItem("refresh_token"),
}: {
  token?: string | null;
}): Promise<any> => {
  return axios
    .post(`${BASE_URL}/personal-logout`, {
      refresh_token: token,
    })
    .then((res) => res)
    .catch((err) => err);
};
