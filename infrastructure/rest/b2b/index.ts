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

const BASE_URL =
  process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id";

export const restSetDefaultSignature = ({
  payload,
  token = localStorage.getItem("token"),
}: {
  payload: TSetDefaultSignatureRequestData;
  token?: string | null;
}): Promise<TSetDefaultSignatureResponseData> => {
  return axios
    .post<TSetDefaultSignatureResponseData>(
      `${BASE_URL}/default-signature`,
      payload,
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

export const restSetDefaultMFA = ({
  payload,
  token = localStorage.getItem("token"),
}: {
  payload: TSetDefaultMFARequestData;
  token?: string | null;
}): Promise<TSetDefaultSignatureResponseData> => {
  return axios
    .post<TSetDefaultSignatureResponseData>(
      `${BASE_URL}/default-mfa`,
      payload,
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

export const RestConfirmCertificate = (
  body: TConfirmCertificateRequestData,
  token?: string | null
): Promise<TConfirmCertificateResponseData> => {
  token = token ? token : localStorage.getItem("token");
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
  token = token ? token : localStorage.getItem("token");
  return axios
    .get<TGetRegisteredCertificateResponseData>(
      `${BASE_URL}/registered?companyid=${body.company_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const restGetOtp = ({
  token = localStorage.getItem("token"),
}: {
  token?: string | null;
}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/totp`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const getUserName = ({
  token = localStorage.getItem("token"),
}: {
  token?: string | null;
}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/default-signature-mfa`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
  token = localStorage.getItem("token"),
}: {
  params?: string;
  token?: string | null;
}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/certificationlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
