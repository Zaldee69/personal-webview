// Step status description
// A -> upload ktp; OCR;
// B -> liveness
// C -> dalam proses (transisi antara B ke D kalau proses d B memakan waktu lama)
// D -> final form / PIN
// E -> eror (kalau pas ngecek dukcapil ada masalah)
// F -> failed  (gagal liveness 3 kali, pas dukcapil di blg foto dan nama dan nik tidak sama, expired)
// S -> sukses
export type TStepStatus = "D" | "A" | "E" | "F" | "S" | "B" | "C";

export type TKycCheckStepRequestData = {
  registerId: string;
};

export type TKycCheckStepResponseData = {
  success: boolean;
  message: string;
  data: {
    status: TStepStatus;
    token?: string;
    pin_form?: boolean; // shown when status === 'D'
  };
};

export type TKycFinalFormRequestData = {
  registerId: string;
  password: string;
  tilakaName: string;
};

export type TKycFinalFormResponseData = {
  success: boolean;
  message: string;
  data: {
    status: string;
  };
};

export type TKycGenerateActionRequestData = {
  registerId: string;
};

export type TKycGenerateActionResponseData = {
  success: boolean;
  message: string;
  data: {
    actionList: string[];
  };
};

export type TKycVerificationRequestData = {
  registerId: string;
  mode: string;
  image_selfie: string;
  image_action1: string;
  image_action2: string;
  image_action3: string;
};

export type TKycVerificationResponseData = {
  success: boolean;
  message: string;
  data: {
    nik: string;
    name: string;
    email: string;
    companyname: string;
    status: TStepStatus;
    pin_form: boolean;
    numFailedLivenessCheck?: number;
  };
};
