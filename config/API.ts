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
  // switch (props.pathname) {
  //   case "/login":
  //     if (props.channel_id) {
  //       API.defaults.headers.common["channel-id"] = props.channel_id;
  //     } else {
  //       delete API.defaults.headers.common["channel-id"];
  //     }
  //     break;
  //   default:
  //     if(props.token && props.channel_id && props.channel_auth){
  //       API.defaults.headers.common["Authorization"] = props.token
  //       API.defaults.headers.common["channel-id"] = props.channel_id
  //       API.defaults.headers.common["channel-auth"] = props.channel_auth
  //     }else {
  //       delete API.defaults.headers.common["Authorization"]
  //       delete API.defaults.headers.common["channel-id"]
  //       delete API.defaults.headers.common["channel-auth"]
  //     }
  // }
};
