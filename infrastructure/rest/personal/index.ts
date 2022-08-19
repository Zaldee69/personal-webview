import axios from "axios";
import {
  TPersonalResetPasswordRequestData,
  TPersonalResetPasswordResponseData,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_PERSONAL_API_URL || "http://10.117.1.151:8080";

export const RestPersonalResetPassword = ({
  payload,
}: {
  payload: TPersonalResetPasswordRequestData;
}): Promise<TPersonalResetPasswordResponseData> => {
  return axios
    .post<TPersonalResetPasswordResponseData>(
      `${BASE_URL}/v1/personal/resetPassword`,
      payload
    )
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
};
