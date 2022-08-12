import axios from "axios";

type Props = {
  channel_id?: string;
  pathname: string;
  channel_auth?: string;
  token? : string
};

// Create base URL API
export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id",
});

