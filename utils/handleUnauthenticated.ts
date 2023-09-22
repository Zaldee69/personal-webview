import React from "react";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";

interface HandleUnauthenticatedProps {
  redirectTo: () => void;
}

const handleUnauthenticated = (props: HandleUnauthenticatedProps) => {
  toast.dismiss("info");
  toast("Anda harus login terlebih dahulu", {
    type: "error",
    toastId: "error",
    position: "top-center",
    icon: XIcon,
  });
  props.redirectTo();
};
export default handleUnauthenticated;
