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
    tilaka_id: string;
    message: string;
    status: boolean;
    nik?: string,
    token?: string
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