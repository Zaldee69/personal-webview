export interface TSigningRequestData {
    file_name:       string;
    otp_pin:         string;
    content_pdf:     string;
    face_image:      string;
    signature_image: string;
    width:           number;
    height:          number;
    coordinate_x:    number;
    coordinate_y:    number;
    page_number:     number;
    qr_content:      string;
    tilakey:         string;
    company_id:      string;
    api_id:          string;
    trx_id:          string;
}

export interface TSigningResponseData {
    success: boolean;
    message: string;
    data: any;
}

export interface TSigningAuthPINRequestData {
    pin: string;
    user: string;
    id: string;
}

export interface TSignedPDFResponseData {
    signing_id: string;
    pdf: string;
}

export interface TSigningAuthPINResponseData {
    success: boolean;
    message: string;
    request_id: string;
    signed_pdf: TSignedPDFResponseData[]
}