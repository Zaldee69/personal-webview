export type TLoginPayload = {
  request_id: string;
  password: string;
  tilaka_name: string;
  company_id: string;
};

type Status = {
  status: "PENDING" | "FULLFILLED" | "REJECTED" | "IDDLE";
};

export type TLoginInitialState = {
  data: {
   data : string,
   message : string
   success : boolean
  };
} & Status;

export type TLoginProps = {
  password: string;
  transaction_id?: string;
  tilaka_name: string;
  channel_id?: string;
  request_id?: string;
  nik?: string;
  company_id? : string
};

export type TImagesPayload = {
  step: string
  action: string
}
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
      tandaTangan: string
    };
  } & Status;
} 

export type TDocumentProps = {
  transaction_id: string;
  company_id: string;
};

export type TUserData = {
  name: string
  signatureFont: string
  typeMfa: string
  typeSignature: number
}