import FRCamera from "@/components/FRCamera";
import DownloadIcon from "@/public/icons/DownloadIcon";
import XIcon from "@/public/icons/XIcon";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { handleRoute } from "@/utils/handleRoute";
import {
  RestSigningAuthPIN,
  RestSigningDownloadSignedPDF,
} from "infrastructure";
import { getUserName, restGetOtp, restLogout } from "infrastructure/rest/b2b";
import { ISignedPDF } from "infrastructure/rest/signing/types";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { PinInput } from "react-input-pin-code";
import { toast } from "react-toastify";
import i18n from "i18"

interface IParameterFromRequestSign {
  user?: string;
  id?: string;
  channel_id?: string;
  request_id?: string;
}
interface IModal {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
  callbackSuccess: () => void;
  callbackFailure: (
    documentName: string,
    siginingFailureError: { message: string; status: string }
  ) => void;
  documentList: ISignedPDF[];
  tilakaName?: string;
}

interface ISigningFailureError {
  message: string;
  status: string;
}

type TPropsSigning = {};

type TPropsSigningSuccess = { documentCount: number };

type TPropsSigningFailure = {
  documentName?: string;
  error: ISigningFailureError;
};

const Signing = (props: TPropsSigning) => {
  const router = useRouter();
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;
  
  const {t}: any = i18n

  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [shouldDisableSubmit, setShouldDisableSubmit] =
    useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const [documentList, setDocumentList] = useState<ISignedPDF[]>([]);
  const [isSuccess, setIsSuccess] = useState<"-1" | "0" | "1">("-1");
  const [signingFailureDocumentName, setSigningFailureDocumentName] =
    useState<string>("");
  const [signingFailureError, setSiginingFailureError] =
    useState<ISigningFailureError>({
      message: "",
      status: "",
    });
  const [typeMFA, setTypeMFA] = useState<"FR" | "OTP" | null>(null);

  const agreeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgree(e.target.checked);
  };
  const downloadOnClick = (pdfBase64: string, pdfName: string) => {
    toast.success(`Download Nama ${pdfName} berhasil`, { autoClose: 1000 });
    setTimeout(() => {
      var a = document.createElement("a");
      a.href = "data:application/pdf;base64," + pdfBase64;
      a.download = pdfName;
      a.click();
    }, 2000);
  };
  const mfaCallbackSuccess = () => {
    setIsSuccess("1");
  };
  const mfaCallbackFailure = (
    documentName: string,
    siginingFailureError: ISigningFailureError
  ) => {
    setIsSuccess("0");
    setSigningFailureDocumentName(documentName);
    setSiginingFailureError(siginingFailureError);
  };

  useEffect(() => {
    const token_v2 = localStorage.getItem("token_v2");
    const count = parseInt(localStorage.getItem("count_v2") as string);
    localStorage.setItem("count_v2", count ? count.toString() : "0");
    if (!token_v2) {
      router.replace({
        pathname: handleRoute("/login/v2"),
        query: { ...router.query },
      });
    } else {
      setShouldRender(true);
    }
    if (token_v2 && routerIsReady) {
      setShouldDisableSubmit(true);
      RestSigningDownloadSignedPDF({
        request_id: routerQuery.request_id as string,
      })
        .then((res) => {
          if (res.success) {
            setDocumentList(res.signed_pdf || []);
            getUserName({ token: token_v2 })
              .then((res) => {
                const data = JSON.parse(res.data);
                setTypeMFA(data.typeMfa);
                setShouldDisableSubmit(false);
              })
              .catch((err) => {
                if (err.request.status === 401) {
                  restLogout({
                    token: localStorage.getItem("refresh_token_v2"),
                  });
                  localStorage.removeItem("token_v2");
                  localStorage.removeItem("refresh_token_v2");
                  router.replace({
                    pathname: "/login/v2",
                    query: { ...router.query, showAutoLogoutInfo: "1" },
                  });
                } else {
                  toast(
                    err.response?.data?.message ||
                      "Tidak berhasil pada saat memuat Signature MFA",
                    {
                      type: "error",
                      toastId: "error",
                      position: "top-center",
                      icon: XIcon,
                    }
                  );
                }
              });
          } else {
            setIsSuccess("0");
            setSigningFailureDocumentName("");
            if (res.status === "DENIED") {
              setSiginingFailureError({
                message: res.message || "Status dokument DENIED",
                status: res.status,
              });
            } else if (res.status === "PROCESS") {
              if (res.signed_pdf === null) {
                setSiginingFailureError({
                  message: "Dokumen Expired",
                  status: "Exp",
                });
              } else {
                setSiginingFailureError({
                  message:
                    res.message ||
                    "Tidak berhasil pada saat memuat list dokumen",
                  status: "Exp",
                });
              }
            } else {
              setSiginingFailureError({
                message:
                  res.message || "Tidak berhasil pada saat memuat list dokumen",
                status: "Exp",
              });
            }
          }
        })
        .catch((err) => {
          if (
            err.response?.data?.message &&
            err.response?.data?.data?.errors?.[0]
          ) {
            setIsSuccess("0");
            setSigningFailureDocumentName("");
            setSiginingFailureError({
              message: `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
              status: "Exp",
            });
          } else {
            if (err.response.status === 401) {
              restLogout({ token: localStorage.getItem("refresh_token_v2") });
              localStorage.removeItem("token_v2");
              localStorage.removeItem("refresh_token_v2");
              router.replace({
                pathname: handleRoute("/login/v2"),
                query: { ...router.query, showAutoLogoutInfo: "1" },
              });
            } else {
              setIsSuccess("0");
              setSigningFailureDocumentName("");
              setSiginingFailureError({
                message:
                  err.response?.data?.message ||
                  "Kesalahan pada saat memuat list dokumen",
                status: "Exp",
              });
            }
          }
        });
    }
  }, [routerIsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return;
  if (isSuccess === "1") {
    return <SigningSuccess documentCount={documentList.length} />;
  } else if (isSuccess === "0") {
    return (
      <SigningFailure
        documentName={signingFailureDocumentName}
        error={signingFailureError}
      />
    );
  }
  return (
    <div>
      <FRModal
        modal={openFRModal}
        setModal={setopenFRModal}
        callbackSuccess={mfaCallbackSuccess}
        callbackFailure={mfaCallbackFailure}
        documentList={documentList}
      />
      <OTPModal
        modal={otpModal}
        setModal={setOtpModal}
        callbackSuccess={mfaCallbackSuccess}
        callbackFailure={mfaCallbackFailure}
        documentList={documentList}
      />

      <div className="px-10 py-8 text-center flex flex-col justify-center min-h-screen">
        <div>
          <p className="font-poppins text-lg font-semibold text-neutral800">
            {t("signSuccess")}
          </p>
          <div className="mt-3">
            <Image
              src={`${assetPrefix}/images/signatureRequest.svg`}
              width="120px"
              height="120px"
              alt="signing-request-ill"
            />
          </div>
          <div className="mt-3 flex justify-center">
            <p
              className="font-poppins text-sm text-neutral800 text-left"
              style={{ maxWidth: "360px" }}
            >
             {t("signRequestSubtitle")}
            </p>
          </div>
        </div>
        <div className="mt-6 mx-auto w-full" style={{ maxWidth: "360px" }}>
          <p className="font-poppins font-semibold text-sm text-neutral200 text-left">
            {documentList.length} {t("document")}
          </p>
          <div className="flex justify-center">
            <div
              className="mt-2 border border-neutral50 p-4 rounded-md w-full overflow-y-auto"
              style={{ maxHeight: "190px" }}
            >
              {documentList.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between ${
                    i !== 0 ? "mt-4" : ""
                  }`}
                >
                  <p className="text-sm text-neutral800 truncate">
                    {e.pdf_name}
                  </p>
                  <button onClick={() => downloadOnClick(e.pdf, e.pdf_name)}>
                    <DownloadIcon />
                  </button>
                </div>
              ))}
              {shouldDisableSubmit && documentList.length === 0 && (
                <p className="text-sm text-neutral800">{t("livenessSuccessSubtitle")}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center mt-7" style={{ maxWidth: "360px" }}>
            <input
              id="agree"
              name="agree"
              type="checkbox"
              className="form-checkbox cursor-pointer text-primary"
              onChange={agreeOnChange}
            />
            <label
              className="ml-3 text-neutral800 font-poppins text-left text-sm cursor-pointer select-none"
              htmlFor="agree"
            >
              {t("signCheckbox")}
            </label>
          </div>
        </div>
        <div className="mt-8">
          <button
            disabled={shouldDisableSubmit || !agree}
            className="bg-primary disabled:bg-primary70 hover:opacity-50 disabled:hover:opacity-100 text-white disabled:text-neutral200 font-poppins rounded-md px-6 py-2.5"
            onClick={() =>
              typeMFA === "FR" ? setopenFRModal(true) : setOtpModal(true)
            }
          >
            {t("sign")}
          </button>
        </div>
        <div className="mt-6">
          <div className="flex justify-center">
            <Image
              src={`${assetPrefix}/images/poweredByTilaka.svg`}
              alt="powered-by-tilaka"
              width="80px"
              height="41.27px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SigningSuccess = (props: TPropsSigningSuccess) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const params = {
    user_identifier: routerQuery.user,
    request_id: routerQuery.request_id,
    status: "Sukses",
  };
  const queryString = new URLSearchParams(params as any).toString();

  const {t}: any = i18n

  return (
    <div className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen">
      <div>
        <p className="font-poppins text-lg font-semibold text-neutral800">
          {t("signSuccess")}
        </p>
        <div className="mt-3">
          <Image
            src={`${assetPrefix}/images/signingSuccess.svg`}
            width="196px"
            height="196px"
            alt="signing-success-ill"
          />
        </div>
        <div className="mt-3">
          <p className="font-poppins text-sm text-neutral800">
            {props.documentCount} {t('documentSuccess')}
          </p>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a
              href={concateRedirectUrlParams(
                routerQuery.redirect_url,
                queryString
              )}
            >
              <a>{t("livenessSuccessButtonTitle")}</a>
            </a>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="80px"
            height="41.27px"
          />
        </div>
      </div>
    </div>
  );
};

const SigningFailure = (props: TPropsSigningFailure) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const params = {
    user_identifier: routerQuery.user,
    request_id: routerQuery.request_id,
    status: props.error.status,
  };
  const queryString = new URLSearchParams(params as any).toString();
  const {t}: any = i18n

  return (
    <div className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen">
      <div>
        <p className="font-poppins text-lg font-semibold text-neutral800">
          {t("signFailed")}
        </p>
        <div className="mt-3">
          <Image
            src={`${assetPrefix}/images/signingFailure.svg`}
            width="196px"
            height="196px"
            alt="signing-failure-ill"
          />
        </div>
        <div className="mt-3">
          <p className="font-poppins text-sm text-neutral800">
            {t("signProcess")}{" "}
            {props.documentName ? t("name") + props.documentName : ""} {t("failed")}.
          </p>
          <p className="font-poppins text-base text-neutral800 font-medium mt-1.5">
            {props.error.message}
          </p>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a
              href={concateRedirectUrlParams(
                routerQuery.redirect_url,
                queryString
              )}
            >
              <a>{t("livenessSuccessButtonTitle")}</a>
            </a>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="80px"
            height="41.27px"
          />
        </div>
      </div>
    </div>
  );
};

const FRModal: React.FC<IModal> = ({
  modal,
  setModal,
  callbackSuccess,
  callbackFailure,
  documentList,
}) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);

  const signingFailure = (message: string) => {
    callbackFailure(
      documentList[0].pdf_name, // currently not support bulk signing, so we use docuemnt on index 0
      { message, status: "Gagal" }
    );
  };
  const captureProcessor = (base64Img: string | null | undefined) => {
    RestSigningAuthPIN({
      payload: {
        face_image: base64Img?.split(",")[1] as string,
        id: routerQuery.id as string,
        user: routerQuery.user as string,
      },
      token: localStorage.getItem("token_v2"),
    })
      .then((res) => {
        if (res.success) {
          localStorage.setItem("count_v2", "0");
          toast.dismiss("info");
          toast(`Pencocokan berhasil`, {
            type: "success",
            position: "top-center",
          });
          setIsFRSuccess(true);
        } else {
          setIsFRSuccess(false);
          toast.dismiss("info");
          setModal(false);
          toast.error(res.message || "Ada yang salah", { icon: <XIcon /> });
          const newCount =
            parseInt(localStorage.getItem("count_v2") as string) + 1;
          localStorage.setItem("count_v2", newCount.toString());
          const count = parseInt(localStorage.getItem("count_v2") as string);
          if (
            count >= 5 ||
            res.message.toLowerCase() ===
              "penandatanganan dokumen gagal. gagal FR sudah 5 kali".toLocaleLowerCase()
          ) {
            signingFailure(res.message || "Ada yang salah");
          }
        }
      })
      .catch((err) => {
        setIsFRSuccess(false);
        toast.dismiss("info");
        setModal(false);
        if (err.request.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_v2") });
          localStorage.removeItem("token_v2");
          localStorage.removeItem("refresh_token_v2");
          router.replace({
            pathname: "/login/v2",
            query: { ...router.query, showAutoLogoutInfo: "1" },
          });
        } else {
          toast.error(err.response?.data?.message || "Wajah tidak cocok", {
            icon: <XIcon />,
          });
          const newCount =
            parseInt(localStorage.getItem("count_v2") as string) + 1;
          localStorage.setItem("count_v2", newCount.toString());
          const count = parseInt(localStorage.getItem("count_v2") as string);
          if (count >= 5) {
            signingFailure(err.response?.data?.message || "Ada yang salah");
          }
        }
      });
  };

  useEffect(() => {
    if (isFRSuccess) {
      callbackSuccess();
      if (modal) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [isFRSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const {t}: any = i18n

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        <>
          <p className="font-poppins block text-center font-semibold ">
            {t("frTitle")}
          </p>
          <span className="font-poppins mt-2 block text-center text-sm font-normal">
          {t("frSubtitle1")}
          </span>
          <FRCamera
            setModal={setModal}
            setIsFRSuccess={setIsFRSuccess}
            signingFailedRedirectTo={handleRoute("/login/v2")}
            tokenIdentifier="token_v2"
            callbackCaptureProcessor={captureProcessor}
          />
          <button
            onClick={() => setModal(!modal)}
            className="text-primary btn uppercase bg-white font-poppins w-full mt-5 mx-auto rounded-sm h-9 font-semibold hover:opacity-50"
          >
            {t("cancel")}
          </button>
        </>
      </div>
    </div>
  ) : null;
};

const OTPModal: React.FC<IModal> = ({
  modal,
  setModal,
  callbackSuccess,
  callbackFailure,
  documentList,
}) => {
  const [successSigning, setSuccessSigning] = useState<boolean>(false);
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;

  const [values, setValues] = useState(["", "", "", "", "", ""]);

  const {t}: any = i18n

  const signingFailure = (message: string) => {
    callbackFailure(
      documentList[0].pdf_name, // currently not support bulk signing, so we use docuemnt on index 0
      { message, status: "Gagal" }
    );
  };
  const onClickHandler = () => {
    toast(`Loading...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
    });
    RestSigningAuthPIN({
      payload: {
        otp_pin: values.join(""),
        id: routerQuery.id as string,
        user: routerQuery.user as string,
      },
      token: localStorage.getItem("token_v2"),
    })
      .then((res) => {
        if (res.success) {
          setSuccessSigning(true);
          toast.dismiss("loading");
          localStorage.setItem("count_v2", "0");
        } else {
          setSuccessSigning(false);
          toast.dismiss("loading");
          setModal(false);
          setValues(["", "", "", "", "", ""]);
          toast.error(res.message || "Ada yang salah", { icon: <XIcon /> });
          const newCount =
            parseInt(localStorage.getItem("count_v2") as string) + 1;
          localStorage.setItem("count_v2", newCount.toString());
          const count = parseInt(localStorage.getItem("count_v2") as string);
          if (
            count >= 5 ||
            res.message.toLowerCase() ===
              "penandatanganan dokumen gagal. gagal FR sudah 5 kali".toLocaleLowerCase()
          ) {
            signingFailure(res.message || "Ada yang salah");
          }
        }
      })
      .catch((err) => {
        setSuccessSigning(false);
        toast.dismiss("loading");
        setModal(false);
        setValues(["", "", "", "", "", ""]);
        if (err.request.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_v2") });
          localStorage.removeItem("token_v2");
          localStorage.removeItem("refresh_token_v2");
          router.replace({
            pathname: "/login/v2",
            query: { ...router.query, showAutoLogoutInfo: "1" },
          });
        } else {
          toast.error(err.response?.data?.message || t("otpInvalid"), {
            icon: <XIcon />,
          });
          setValues(["", "", "", "", "", ""]);
          const newCount =
            parseInt(localStorage.getItem("count_v2") as string) + 1;
          localStorage.setItem("count_v2", newCount.toString());
          const count = parseInt(localStorage.getItem("count_v2") as string);
          if (count >= 5) {
            signingFailure(err.response?.data?.message || "Ada yang salah");
          }
        }
      });
  };

  useEffect(() => {
    if (modal && !successSigning) {
      restGetOtp({ token: localStorage.getItem("token_v2") })
        .then((res) => {
          toast(`Kode OTP telah dikirim ke Email anda`, {
            type: "info",
            toastId: "info",
            isLoading: false,
            position: "top-center",
          });
        })
        .catch((err) => {
          if (err.request.status === 401) {
            restLogout({ token: localStorage.getItem("refresh_token_v2") });
            localStorage.removeItem("token_v2");
            localStorage.removeItem("refresh_token_v2");
            router.replace({
              pathname: "/login/v2",
              query: { ...router.query, showAutoLogoutInfo: "1" },
            });
          } else {
            toast.error("Kode OTP gagal dikirim", {
              icon: <XIcon />,
            });
          }
        });
    }
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (successSigning) {
      callbackSuccess();
    }
  }, [successSigning]); // eslint-disable-line react-hooks/exhaustive-deps

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5">
        <div className="flex flex-col">
          <p className="font-poppins block text-center pb-5  whitespace-nowrap  font-semibold ">
            {t("frTitle")}
          </p>
          <span className="font-poppins block text-center pb-5  ">
          {t("frSubtitle2")}
          </span>
          <PinInput
            containerStyle={{
              alignItems: "center",
              gap: 5,
              marginTop: "10px",
            }}
            inputStyle={{ alignItems: "center", gap: 5, marginTop: "10px" }}
            placeholder=""
            size="lg"
            values={values}
            onChange={(value, index, values) => setValues(values)}
          />
          <button
            disabled={values.join("").length < 6}
            onClick={onClickHandler}
            className="bg-primary btn mt-16 disabled:opacity-50 text-white font-poppins mx-auto rounded-sm py-2.5 px-6 font-semibold"
          >
            {t("confirm")}
          </button>
          <button
            onClick={() => {
              setValues(["", "", "", "", "", ""]);
              setModal(!modal);
            }}
            className="  text-primary font-poppins mt-4 hover:opacity-50 w-full mx-auto rounded-sm h-9 font-semibold"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Signing;
