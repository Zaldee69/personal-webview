import { toast } from "react-toastify";
import { TLoginInitialState } from "../interface/interface";
import XIcon from './../public/icons/XIcon';
import i18n from "i18";


const toastCaller = (props : TLoginInitialState) => {
  const {t}: any = i18n
    if (props.status === "PENDING") {
        toast(`Loading...`, {
          type: "info",
          toastId: "info",
          isLoading: true,
          position: "top-center",
        });
      } else if (props.status === "FULLFILLED" && props.data.success) {
        toast.dismiss("info");
        toast(`Login success`, {
          type: "success",
          toastId: "success",
          position: "top-center",
        });
      } else if (
        props.status === "REJECTED" ||
        (props.status === "FULLFILLED" && !props.data.success)
      ) {
        toast.dismiss("info");
        toast(!props.data.message ? "Error" : props.data?.message[0] === "I" ? t("tilakaNameOrPasswordWrong") : props.data.message , {
          type: "error",
          toastId: "error",
          position: "top-center",
          icon : XIcon
        });
      }
}

export default toastCaller