export type TSignatureType = {
  signature_type: 0 | 1
}

export type TFontType = {
  font_type?:
  | "Adine-Kirnberg"
  | "champignonaltswash"
  | "FormalScript"
  | "HerrVonMuellerhoff-Regular"
  | "MrsSaintDelafield-Regular"
  | "SCRIPTIN"
  | ""
}

export type TMultiFactorAuthenticationType = {
  mfa_type : "otp" | "fr" | "otp_ponsel"
}

export type TSetDefaultSignatureRequestData = {
  signature_image: string
  company_id?: string;
} & TSignatureType & TFontType;

export type TSetDefaultSignatureResponseData = {
  success: boolean;
  message: string;
  data: any;
};

export type TSetDefaultMFARequestData  = {} & TMultiFactorAuthenticationType

export type TConfirmCertificateRequestData = {
  serial_number: string,
  company_id: string
}

export type TConfirmCertificateResponseData = {
  success: boolean,
  message: string,
  data: string[]
}

export type TGetCertificateListRequestData = {
  company_id: string
}

export type TGetCertificateListResponseData = {
  success: boolean,
  message: string,
  data: string[]
}

export type TGetRegisteredCertificateRequestData = {
  company_id: string
}

export type TGetRegisteredCertificateResponseData = {
  success: boolean,
  message: string,
  data: string[]
}

