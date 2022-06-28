export type TSetDefaultSignatureRequestData = {
  signature_image: string
  signature_type: 0 | 1;
  font_type?:
    | "signature_font_type_allan"
    | "signature_font_type_aguafinaScript"
    | "signature_font_type_architectsDaughter"
    | "signature_font_type_giveYouGlory"
    | "signature_font_type_berkshireSwash"
    | "signature_font_type_missFajardose"
    | ""
  company_id?: string;
};

export type TSetDefaultSignatureResponseData = {
  success: boolean;
  message: string;
  data: any;
};

export type TSetDefaultMFARequestData = {
  mfa_type : "otp" | "fr" | "otp_ponsel"
}
