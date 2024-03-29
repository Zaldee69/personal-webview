import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export type TLoginPayload = {
  request_id?: string;
  password: string;
  tilaka_name: string;
  channel_id: string;
  device_token?: string;
  remember?: boolean;
};

export type Status = {
  status: "PENDING" | "FULLFILLED" | "REJECTED" | "IDDLE";
};

export type TLoginInitialState = {
  data: {
    data: string;
    message: string;
    success: boolean;
    nik: string;
  };
} & Status;

export type TLoginProps = {
  password: string;
  transaction_id?: string;
  tilaka_name: string;
  channel_id?: string;
  request_id?: string;
  nik?: string;
  company_id?: string;
  remember?: boolean;
};

export type TImagesPayload = {
  step: string;
  action: string;
};
export type TDocumentResponse = {
  response: {
    success: string;
    message: boolean;
    data: {
      document: string;
      mfa: "FR" | "OTP";
      posX: number;
      posY: number;
      width: number;
      height: number;
      tandaTangan: string;
      page_number: number;
    };
  } & Status;
};

export type TDocumentProps = {
  transaction_id: string;
  company_id: string;
  token: string;
};

export type TUserData = {
  name: string;
  signatureFont: string;
  typeMfa: string;
  typeSignature: number;
};

export interface IserverSideRenderReturnConditions {
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>;
  checkStepResult: {
    res?: TKycCheckStepResponseData;
    err?: {
      response: {
        data: {
          success: boolean;
          message: string;
          data: { errors: string[] };
        };
      };
    };
  };
  isNotRedirect?: boolean;
}
