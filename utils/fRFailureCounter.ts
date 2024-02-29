import { toast } from "react-toastify";
import {
  getFRFailedCount,
  setFRFailedCount,
} from "./frFailedCountGetterSetter";
import XIcon from "@/public/icons/XIcon";
import handleUnauthenticated from "./handleUnauthenticated";

interface FRFailureCounterProps {
  redirectTo: () => void;
  failureCountIdentifier?: string;
  failureMessage?: string;
  errorMessage: string;
  tokenIdentifier?: string;
  maximumFailure?: number;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const fRFailureCounter = ({
  redirectTo,
  failureCountIdentifier = "set_mfa_count",
  failureMessage = "Anda sudah gagal FR 5 kali",
  tokenIdentifier = "token",
  maximumFailure = 5,
  errorMessage,
  setModal,
}: FRFailureCounterProps) => {
  const doCounting: number = getFRFailedCount(failureCountIdentifier) + 1;
  setFRFailedCount(failureCountIdentifier, doCounting);
  const newCount: number = getFRFailedCount(failureCountIdentifier);

  if (newCount >= maximumFailure) {
    toast.error(failureMessage, { icon: XIcon });
    setFRFailedCount(failureCountIdentifier, 0);
    localStorage.removeItem(tokenIdentifier);
    redirectTo()
  } else {
    toast.error(errorMessage, { icon: XIcon });
    setModal(false);
    setTimeout(() => {
      setModal(true);
    }, 100);
  }
};

export default fRFailureCounter;
