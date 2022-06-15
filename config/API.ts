import axios from "axios";

type Props = {
  channel_id?: string;
  pathname: string;
  channel_auth?: string;
  token? : string
};

// Create base URL API
export const API = axios.create({
  baseURL: "http://10.117.1.151:8080/v1/personal",
});

// Set Authorization Token Header
export const setAuthToken = (props: Props) => {
  switch (props.pathname) {
    case "/signing":
      if(props.token){
        API.defaults.headers.common["Authorization"] =`Bearer ${props.token}`
      }else {

        delete API.defaults.headers.common["Authorization"]
      }
  }
};
