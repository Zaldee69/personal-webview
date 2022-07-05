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
}: {
  payload: TSetDefaultSignatureRequestData;
}): Promise<TSetDefaultSignatureResponseData> => {
  return axios
    .post<TSetDefaultSignatureResponseData>(
      `${BASE_URL}/default-signature`,
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
      `${BASE_URL}/default-mfa`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err;
      });
  }

export const RestConfirmCertificate = (
  body: TConfirmCertificateRequestData
): Promise<TConfirmCertificateResponseData> => {
  return axios
    .post<TConfirmCertificateResponseData>(`${BASE_URL}/confirm`, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    })
    .then((res) =>  res.data )
    .catch((err) => { 
      throw err;
      })
}

export const RestRegisteredCertificate = (
  body: TGetRegisteredCertificateRequestData
): Promise<TGetRegisteredCertificateResponseData> => {
  return axios
    .get<TGetRegisteredCertificateResponseData>(`${BASE_URL}/registered?companyid=${body.company_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    })
    .then((res) =>  res.data )
    .catch((err) => { 
      throw err;
     })
}



export const restGetOtp = ({}: {}): Promise<any> => {
  return axios
    .get(`${BASE_URL}/totp`, {
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
    .get(`${BASE_URL}/default-signature-mfa`, {
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
    .get(`${BASE_URL}/certificationlist`, {
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

export const restLogout = ()  : Promise<any> => {
  const token =localStorage.getItem("refresh_token")
  return axios
  .post(`http://10.117.1.151:8080/v1/personal/logout`, {
    refresh_token : token,
  })
    .then(res => res)
    .catch(err => err)
}
