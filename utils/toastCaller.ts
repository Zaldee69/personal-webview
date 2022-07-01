import { toast } from "react-toastify";
import { TLoginInitialState } from "../interface/interface";
import XIcon from './../public/icons/XIcon';


const toastCaller = (props : TLoginInitialState) => {
    if (props.status === "PENDING") {
        toast(`Loading...`, {
          type: "info",
          toastId: "info",
          isLoading: true,
          position: "top-center",
        });
      } else if (props.status === "FULLFILLED" && props.data.success) {
        toast.dismiss("info");
        toast(`Login berhasil`, {
          type: "success",
          position: "top-center",
        });
      } else if (
        props.status === "REJECTED" ||
        (props.status === "FULLFILLED" && !props.data.success)
      ) {
        toast.dismiss("info");
        toast(!props.data.message ? "Error" : props.data?.message[0] === "I" ? "Tilaka name / Kata sandi salah" : props.data.message , {
          type: "error",
          toastId: "error",
          position: "top-center",
          icon : XIcon
        });
      }
}

export default toastCaller