import axios from "axios";
import {
  TPersonalChangePasswordRequestData,
  TPersonalChangePasswordResponseData,
  TPersonalRequestChangePasswordRequestData,
  TPersonalRequestChangePasswordResponseData,
  TPersonalResetPasswordRequestData,
  TPersonalResetPasswordResponseData,
  TPersonalSetPasswordRequestData,
  TPersonalSetPasswordResponseData,
  TPersonalFaceRecognitionRequestData,
  TPersonalFaceRecognitionResponseData,
  TPersonalApproveConsentResponse,
  TPersonalFaceRecognitionRequestDataV2,
  TPersonalRequestTilakaNameRequestData,
  TPersonalRequestTilakaNameResponseData,
  TPersonalRequestResetPasswordRequestData,
  TPersonalRequestResetPasswordResponseData,
  TPersonalPManualRegRequestData,
  TPersonalPManualRegResponseData,
  TThemeResponse,
  TOTPResponse,
  IOTPDedicatedResponse,
} from "./types";

import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { getStorageWithExpiresIn } from "@/utils/localStorageWithExpiresIn";
import { initialState } from "@/redux/slices/themeSlice";
import { setTokenToLocalStorage } from "@/utils/token";
import CORE_API from "@/config/API";

const BASE_URL =
  process.env.NEXT_PUBLIC_PERSONAL_API_URL || "https://dev-api.tilaka.id";

export const RestPersonalResetPassword = ({
  payload,
}: {
  payload: TPersonalResetPasswordRequestData;
}): Promise<TPersonalResetPasswordResponseData> => {
  return axios
    .post<TPersonalResetPasswordResponseData>(
      `${BASE_URL}/resetPassword`,
      payload
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalRequestChangePassword = ({
  payload,
}: {
  payload: TPersonalRequestChangePasswordRequestData;
}): Promise<TPersonalRequestChangePasswordResponseData> => {
  return axios
    .post<TPersonalRequestChangePasswordResponseData>(
      `${BASE_URL}/requestChangePassword`,
      payload
    )
    .then((res) => {
      setTokenToLocalStorage(
        res.data.data?.[0] || null,
        "personal_change_password_token"
      );
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalRequestTilakaName = ({
  payload,
}: {
  payload: TPersonalRequestTilakaNameRequestData;
}): Promise<TPersonalRequestTilakaNameResponseData> => {
  return axios
    .post<TPersonalRequestTilakaNameResponseData>(
      `${BASE_URL}/requestTilakaName`,
      payload
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalRequestResetPassword = ({
  payload,
}: {
  payload: TPersonalRequestResetPasswordRequestData;
}): Promise<TPersonalRequestResetPasswordResponseData> => {
  return axios
    .post<TPersonalRequestResetPasswordResponseData>(
      `${BASE_URL}/pRequestResetPassword`,
      payload
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalChangePassword = ({
  payload,
}: {
  payload: TPersonalChangePasswordRequestData;
}): Promise<TPersonalChangePasswordResponseData> => {
  return axios
    .post<TPersonalChangePasswordResponseData>(
      `${BASE_URL}/changePassword`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "personal_change_password_token"
          )}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalSetPassword = ({
  payload,
}: {
  payload: TPersonalSetPasswordRequestData;
}): Promise<TPersonalSetPasswordResponseData> => {
  return axios
    .post<TPersonalSetPasswordResponseData>(`${BASE_URL}/setPassword`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalFaceRecognition = ({
  payload,
}: {
  payload: TPersonalFaceRecognitionRequestData;
}): Promise<TPersonalFaceRecognitionResponseData> => {
  return axios
    .post<TPersonalFaceRecognitionResponseData>(
      `${BASE_URL}/face-verification`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getStorageWithExpiresIn("token")}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalFaceRecognitionV2 = ({
  payload,
}: {
  payload: TPersonalFaceRecognitionRequestDataV2;
}): Promise<TPersonalFaceRecognitionResponseData> => {
  return CORE_API.post<TPersonalFaceRecognitionResponseData>(
    `/checkFr`,
    payload
  )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestKycCheckStepv2 = ({
  registerId,
}: {
  registerId: string;
}): Promise<TKycCheckStepResponseData> => {
  return axios
    .post<TKycCheckStepResponseData>(`${BASE_URL}/checkstep`, { registerId })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalApproveConsent = ({
  registerId,
  tilakaName,
}: {
  registerId: string;
  tilakaName: string;
}): Promise<TPersonalApproveConsentResponse> => {
  return axios
    .post<TPersonalApproveConsentResponse>(
      `${BASE_URL}/approveConsent`,
      {
        registerId,
        tilakaName,
      },
      {
        headers: {
          Authorization: `Bearer ${getStorageWithExpiresIn("token")}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalPManualReg = (
  payload: TPersonalPManualRegRequestData
): Promise<TPersonalPManualRegResponseData> => {
  return axios
    .post<TPersonalPManualRegResponseData>(`${BASE_URL}/pManualReg`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestPersonalPManualRegV2 = (payload: {
  photo_selfie: string;
  register_id: string;
}): Promise<TPersonalPManualRegResponseData> => {
  return axios
    .post<TPersonalPManualRegResponseData>(`${BASE_URL}/pManualReg`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestThemeConfiguration = ({
  uuid,
  type,
}: {
  uuid?: string;
  type?: "channel_id" | "request_id";
}): Promise<TThemeResponse> => {
  return axios
    .get(`${BASE_URL}/channel/get_webview_configuration?${type}=${uuid}`)
    .then((res) => {
      if (res.data.success) {
        return res.data;
      }
      return initialState;
    })
    .catch((err) => {
      throw err;
    });
};

export const RestGenerateOTPRegistration = ({
  request_id,
}: {
  request_id: string;
}): Promise<TOTPResponse> => {
  return axios
    .post(`${BASE_URL}/v2/generateOtpRegistration`, null, {
      params: {
        request_id,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestResendOTPRegistration = ({
  request_id,
}: {
  request_id: string;
}): Promise<TOTPResponse> => {
  return axios
    .post(`${BASE_URL}/v2/resendOtpRegistration`, null, {
      params: {
        request_id,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestVerifyOTPRegistration = ({
  payload,
}: {
  payload: {
    otp: string;
    request_id: string;
  };
}): Promise<TOTPResponse> => {
  return axios
    .post(`${BASE_URL}/v2/verifyOtpRegistration`, payload)
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};

export const RestOTPDedicated = async ({
  user,
  id,
}: {
  user: string;
  id: string;
}): Promise<IOTPDedicatedResponse> => {
  return axios
    .get(`${BASE_URL}/totp-dedicated`, {
      params: {
        user,
        id,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
