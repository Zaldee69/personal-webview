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
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { PinInput } from "react-input-pin-code";
import { toast } from "react-toastify";
import i18n from "i18";
import EyeIcon2 from "@/public/icons/EyeIcon2";
import EyeIcon3 from "@/public/icons/EyeIcon3";
import CheckEvalGrayIcon from "@/public/icons/CheckOvalGrayIcon";
import CheckEvalGreenIcon from "@/public/icons/CheckOvalGreenIcon";
import { ViewerV2 } from "@/components/ViewerV2";
import {
  getStorageWithExpiresIn,
  removeStorageWithExpiresIn,
} from "@/utils/localStorageWithExpiresIn";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import Button, { buttonVariants } from "@/components/atoms/Button";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import Label from "@/components/atoms/Label";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";

interface IParameterFromRequestSign {
  user?: string;
  id?: string;
  channel_id?: string;
  request_id?: string;
  mustread?: "1";
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

interface IModalViewer {
  modal: boolean;
  onClose: () => void;
  viewedDoc: {
    pdfBase64: string;
    pdfName: string;
    docIndex: number;
  } | null;
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
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  if (routerQuery.mustread === "1") {
    return <SigningWithRead />;
  }

  return <SigningWithoutRead />;
};

const SigningWithRead = () => {
  const router = useRouter();
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const { t }: any = i18n;

  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [shouldDisableSubmit, setShouldDisableSubmit] =
    useState<boolean>(false);
  const [documentList, setDocumentList] = useState<ISignedPDF[]>([]);
  const [isSuccess, setIsSuccess] = useState<"-1" | "0" | "1" | "2">("-1");
  const [signingFailureDocumentName, setSigningFailureDocumentName] =
    useState<string>("");
  const [signingFailureError, setSiginingFailureError] =
    useState<ISigningFailureError>({
      message: "",
      status: "",
    });
  const [typeMFA, setTypeMFA] = useState<"FR" | "OTP" | null>(null);
  const [agree, setAgree] = useState<boolean>(false);
  const [read, setRead] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const [viewerModal, setViewerModal] = useState<boolean>(false);
  const [documentsHasBeenRead, setDocumentsHasBeenRead] = useState<
    Array<number>
  >([]);
  const [viewedDoc, setViewDocBase64] =
    useState<IModalViewer["viewedDoc"]>(null);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const agreeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgree(e.target.checked);
  };
  const downloadOnClick = (pdfBase64: string, pdfName: string) => {
    toast.success(`Download ${pdfName} ${t("success")}`, { autoClose: 1000 });
    setTimeout(() => {
      var a = document.createElement("a");
      a.href = "data:application/pdf;base64," + pdfBase64;
      a.download = pdfName;
      a.click();
    }, 2000);
  };
  const readOnClick = (
    pdfBase64: string,
    pdfName: string,
    docIndex: number
  ) => {
    // show popup viewer
    setViewerModal(true);
    setViewDocBase64({ pdfBase64, pdfName, docIndex });
  };
  const mfaCallbackSuccess = () => {
    if (routerQuery.async) {
      setIsSuccess("2");
    } else {
      setIsSuccess("1");
    }
  };
  const mfaCallbackFailure = (
    documentName: string,
    siginingFailureError: ISigningFailureError
  ) => {
    setIsSuccess("0");
    setSigningFailureDocumentName(documentName);
    setSiginingFailureError(siginingFailureError);
  };
  const viewerModalOnClose = () => {
    if (viewedDoc && !documentsHasBeenRead.includes(viewedDoc.docIndex)) {
      setDocumentsHasBeenRead([...documentsHasBeenRead, viewedDoc.docIndex]);
    }
    setViewerModal(false);
  };

  useEffect(() => {
    if (!routerIsReady) return;

    const token_v2 = getStorageWithExpiresIn(
      "token_v2",
      handleRoute("login/v2"),
      {
        ...router.query,
        showAutoLogoutInfo: "1",
      }
    );
    const count = parseInt(localStorage.getItem("count_v2") as string);
    localStorage.setItem("count_v2", count ? count.toString() : "0");
    if (!token_v2) {
      router.replace({
        pathname: handleRoute("login/v2"),
        query: { ...router.query },
      });
    } else {
      setShouldRender(true);
    }
    if (token_v2) {
      setShouldDisableSubmit(true);
      RestSigningDownloadSignedPDF({
        request_id: routerQuery.request_id as string,
      })
        .then((res) => {
          if (res.success) {
            setDocumentList(res.signed_pdf || []);
            getUserName({ token: token_v2 })
              .then((res) => {
                if (res.success) {
                  const data = JSON.parse(res.data);
                  setTypeMFA(data.typeMfa);
                  setShouldDisableSubmit(false);
                } else {
                  toast(
                    res?.message || "Ada yang salah saat memuat Signature MFA",
                    {
                      type: "error",
                      toastId: "error",
                      position: "top-center",
                      icon: XIcon,
                    }
                  );
                }
              })
              .catch((err) => {
                if (err.response?.status === 401) {
                  restLogout({
                    token: localStorage.getItem("refresh_token_v2"),
                  });
                  removeStorageWithExpiresIn("token_v2");
                  localStorage.removeItem("refresh_token_v2");
                  router.replace({
                    pathname: handleRoute("login/v2"),
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
                  message: t("documentExpired"),
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
              removeStorageWithExpiresIn("token_v2");
              localStorage.removeItem("refresh_token_v2");
              router.replace({
                pathname: handleRoute("login/v2"),
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
  useEffect(() => {
    if (documentsHasBeenRead.length === 0 || documentList.length === 0) return;
    if (documentsHasBeenRead.length === documentList.length) {
      setRead(true);
    } else {
      return;
    }
  }, [documentsHasBeenRead, documentList]);
  if (!shouldRender) return null;
  if (isSuccess === "1") {
    return <SigningSuccess documentCount={documentList.length} />;
  } else if (isSuccess === "2") {
    return <SigningOnProgress documentCount={documentList.length} />;
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
      <ViewerModal
        modal={viewerModal}
        onClose={viewerModalOnClose}
        viewedDoc={viewedDoc}
      />

      <div
        style={{
          backgroundColor: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.background as string,
            "BG"
          ),
        }}
        className="px-10 py-8 text-center flex flex-col justify-center min-h-screen"
      >
        <div style={{maxWidth: "360px"}} className="mx-auto" >
          <Heading
            className="font-poppins text-lg font-semibold text-neutral800 text-left mx-auto"
          >
            {t("signRequestTitle")}
          </Heading>
          <div
            className="bg-contain mx-auto w-40 h-40 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_signing as string,
                "ASSET",
                `${assetPrefix}/images/signatureRequest.svg`
              )})`,
            }}
          ></div>
          <div className="mt-3 flex justify-center">
            <Paragraph
              className="text-sm text-left"
            >
              {t("signRequestSubtitle.subtitle1")}
              {routerQuery.mustread === "1" ? (
                <>
                  {t("signRequestSubtitle.subtitle3")} <EyeIcon3 />{" "}
                  {t("signRequestSubtitle.subtitle4")}{" "}
                </>
              ) : (
                t("signRequestSubtitle.subtitle2")
              )}
            </Paragraph>
          </div>
        </div>
        <div className="mt-6 mx-auto w-full" style={{ maxWidth: "360px" }}>
          <Paragraph size="sm" className="font-semibold text-left">
            {documentList.length} {t("document")}
          </Paragraph>
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
                  <div className="flex items-center w-3/4">
                    <span className="mr-2.5">
                      {documentsHasBeenRead.includes(i) ? (
                        <CheckEvalGreenIcon />
                      ) : (
                        <CheckEvalGrayIcon />
                      )}
                    </span>
                    <Paragraph size="sm" className="truncate">
                      {e.pdf_name}
                    </Paragraph>
                  </div>
                  <div className="flex items-center justify-end w-1/4">
                    <button
                      onClick={() => readOnClick(e.pdf, e.pdf_name, i)}
                      className="mr-2.5"
                    >
                      <EyeIcon2 />
                    </button>
                    <button onClick={() => downloadOnClick(e.pdf, e.pdf_name)}>
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              ))}
              {shouldDisableSubmit && documentList.length === 0 && (
                <p className="text-sm text-neutral800">{t("loadingTitle")}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div style={{ maxWidth: "360px", width: "100%" }}>
            <div className="flex items-center mt-7">
              <input
                id="read"
                name="read"
                type="checkbox"
                className="form-checkbox cursor-pointer text-primary disabled:opacity-50"
                checked={read}
                disabled
              />
              <Label
                className="ml-3 text-left cursor-pointer select-none"
                htmlFor="read"
              >
                {t("singingReadDocCheckbox")}
              </Label>
            </div>
            <div
              className="flex items-center mt-4"
              style={{ maxWidth: "360px" }}
            >
              <input
                id="agree"
                name="agree"
                type="checkbox"
                className="form-checkbox cursor-pointer text-primary"
                onChange={agreeOnChange}
              />
              <Label
                className="ml-3 text-left cursor-pointer select-none"
                htmlFor="agree"
              >
                {t("singingAgreeDocCheckbox")}
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Button
            disabled={shouldDisableSubmit || !read || !agree}
            size="none"
            className="px-4 fit-content py-2.5"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
              borderRadius: "12px"
            }}
            onClick={() =>
              typeMFA === "FR" ? setopenFRModal(true) : setOtpModal(true)
            }
          >
            {t("sign")}
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  );
};

const SigningWithoutRead = () => {
  const router = useRouter();
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const { t }: any = i18n;

  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [shouldDisableSubmit, setShouldDisableSubmit] =
    useState<boolean>(false);
  const [documentList, setDocumentList] = useState<ISignedPDF[]>([]);
  const [isSuccess, setIsSuccess] = useState<"-1" | "0" | "1" | "2">("-1");
  const [signingFailureDocumentName, setSigningFailureDocumentName] =
    useState<string>("");
  const [signingFailureError, setSiginingFailureError] =
    useState<ISigningFailureError>({
      message: "",
      status: "",
    });
  const [typeMFA, setTypeMFA] = useState<"FR" | "OTP" | null>(null);
  const [agree, setAgree] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const agreeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgree(e.target.checked);
  };
  const downloadOnClick = (pdfBase64: string, pdfName: string) => {
    toast.success(`Download ${pdfName} ${t("success")}`, { autoClose: 1000 });
    setTimeout(() => {
      var a = document.createElement("a");
      a.href = "data:application/pdf;base64," + pdfBase64;
      a.download = pdfName;
      a.click();
    }, 2000);
  };
  const mfaCallbackSuccess = () => {
    if (routerQuery.async) {
      setIsSuccess("2");
    } else {
      setIsSuccess("1");
    }
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
    if (!routerIsReady) return;

    const token_v2 = getStorageWithExpiresIn(
      "token_v2",
      handleRoute("login/v2"),
      {
        ...router.query,
        showAutoLogoutInfo: "1",
      }
    );
    const count = parseInt(localStorage.getItem("count_v2") as string);
    localStorage.setItem("count_v2", count ? count.toString() : "0");
    if (!token_v2) {
      router.replace({
        pathname: handleRoute("login/v2"),
        query: { ...router.query },
      });
    } else {
      setShouldRender(true);
    }
    if (token_v2) {
      setShouldDisableSubmit(true);
      RestSigningDownloadSignedPDF({
        request_id: routerQuery.request_id as string,
      })
        .then((res) => {
          if (res.success) {
            setDocumentList(res.signed_pdf || []);
            getUserName({ token: token_v2 })
              .then((res) => {
                if (res.success) {
                  const data = JSON.parse(res.data);
                  setTypeMFA(data.typeMfa);
                  setShouldDisableSubmit(false);
                } else {
                  toast(
                    res?.message || "Ada yang salah saat memuat Signature MFA",
                    {
                      type: "error",
                      toastId: "error",
                      position: "top-center",
                      icon: XIcon,
                    }
                  );
                }
              })
              .catch((err) => {
                if (err.response?.status === 401) {
                  restLogout({
                    token: localStorage.getItem("refresh_token_v2"),
                  });
                  removeStorageWithExpiresIn("token_v2");
                  localStorage.removeItem("refresh_token_v2");
                  router.replace({
                    pathname: handleRoute("login/v2"),
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
                  message: t("documentExpired"),
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
              removeStorageWithExpiresIn("token_v2");
              localStorage.removeItem("refresh_token_v2");
              router.replace({
                pathname: handleRoute("login/v2"),
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

  if (!shouldRender) return null;
  if (isSuccess === "1") {
    return <SigningSuccess documentCount={documentList.length} />;
  } else if (isSuccess === "2") {
    return <SigningOnProgress documentCount={documentList.length} />;
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

      <div
        style={{
          backgroundColor: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.background as string,
            "BG"
          ),
        }}
        className="px-10 py-8 text-center flex flex-col justify-center min-h-screen"
      >
        <div style={{maxWidth: "360px"}} className="mx-auto" >
          <Heading
            className="text-left mx-auto"
          >
            {t("signRequestTitle")}
          </Heading>
          <div
            className="bg-contain mx-auto w-40 h-40 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_signing as string,
                "ASSET",
                `${assetPrefix}/images/signatureRequest.svg`
              )})`,
            }}
          ></div>
          <div className="mt-3 flex justify-center">
            <Paragraph
              size="sm"
              className="text-left"
            >
              {t("signRequestSubtitle.subtitle1")}
              {routerQuery.mustread === "1" ? (
                <>
                  {t("signRequestSubtitle.subtitle3")} <EyeIcon3 />{" "}
                  {t("signRequestSubtitle.subtitle4")}{" "}
                </>
              ) : (
                t("signRequestSubtitle.subtitle2")
              )}
            </Paragraph>
          </div>
        </div>
        <div className="mt-6 mx-auto w-full" style={{ maxWidth: "360px" }}>
          <Paragraph size="sm" className=" font-semibold text-left">
            {documentList.length} {t("document")}
          </Paragraph>
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
                  <Paragraph className="text-sm  truncate">
                    {e.pdf_name}
                  </Paragraph>
                  <button onClick={() => downloadOnClick(e.pdf, e.pdf_name)}>
                    <DownloadIcon />
                  </button>
                </div>
              ))}
              {shouldDisableSubmit && documentList.length === 0 && (
                <p className="text-sm text-neutral800">{t("loadingTitle")}</p>
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
            <Label
              className="ml-3 text-left text-sm cursor-pointer select-none"
              htmlFor="agree"
            >
              {t("signCheckbox")}
            </Label>
          </div>
        </div>
        <div className="mt-8">
          <Button
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
                borderRadius: "6px"
            }}
            size="none"
            className="px-4 fit-content py-2.5"
            disabled={shouldDisableSubmit || !agree}
            onClick={() =>
              typeMFA === "FR" ? setopenFRModal(true) : setOtpModal(true)
            }
          >
            {t("sign")}
          </Button>
        </div>
        <Footer />
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

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: router.query.redirect_url as string,
  });

  useEffect(() => {
    autoRedirect()
  }, []);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen"
    >
      <div>
        <Heading>
          {t("signSuccess")}
        </Heading>
        <div
          className="bg-contain mx-auto w-52 h-52 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_signing_success as string,
              "ASSET",
              `${assetPrefix}/images/signingSuccess.svg`
            )})`,
          }}
        ></div>
        <div className="mt-3">
          <Paragraph size="sm">
            {props.documentCount} {t("documentSuccess")}
          </Paragraph>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
              className={buttonVariants({
                variant: "link",
                size: "none",
                className: "font-medium",
              })}
              href={concateRedirectUrlParams(
                routerQuery.redirect_url,
                queryString
              )}
            >
              <span>{t("livenessSuccessButtonTitle")}</span>
            </a>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

const SigningOnProgress = (props: TPropsSigningSuccess) => {
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

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: router.query.redirect_url as string,
  });

  useEffect(() => {
    autoRedirect()
  }, []);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="pt-16 px-1 pb-9 text-center flex flex-col justify-center min-h-screen"
    >
      <div>
        <Heading className="mb-10">
          {t("authenticationSuccessTitle")}
        </Heading>
        <div
          className="bg-contain mx-auto w-52 h-52 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_signing_authenticated_success as string,
              "ASSET",
              `${assetPrefix}/images/progress.svg`
            )})`,
          }}
        ></div>
        <div className="mt-3">
          <Paragraph size="sm" className="whitespace-pre-line">
            {t("authenticationSuccessSubtitle")}
          </Paragraph>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium underline">
            <a
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
              className={buttonVariants({
                variant: "link",
                size: "none",
                className: "font-medium",
              })}
              href={generatedUrl}
            >
              <span>{t("livenessSuccessButtonTitle")}</span>
            </a>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

const SigningFailure = (props: TPropsSigningFailure) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const params = {
    user_identifier: routerQuery.user,
    request_id: routerQuery.request_id,
    status: 'Gagal',
  };
  const queryString = new URLSearchParams(params as any).toString();
  const { t }: any = i18n;

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: router.query.redirect_url as string,
  });

  useEffect(() => {
    autoRedirect()
  }, []);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen"
    >
      <div>
        <Heading>
          {t("signFailed")}
        </Heading>
        <div
          className="bg-contain mx-auto w-52 h-52 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_signing_failed as string,
              "ASSET",
              `${assetPrefix}/images/signingFailure.svg`
            )})`,
          }}
        ></div>
        <div className="mt-3">
          <Paragraph size="sm" >
            {t("signFailedSubtitle")}{" "}
          </Paragraph>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
              className={buttonVariants({
                variant: "link",
                size: "none",
                className: "font-medium",
              })}
              href={generatedUrl}
            >
              <span>{t("livenessSuccessButtonTitle")}</span>
            </a>
          </div>
        )}
        <Footer />
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

  const themeConfiguration = useSelector((state: RootState) => state.theme);

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
        async: routerQuery.async as string,
      },
      token: getStorageWithExpiresIn("token_v2", handleRoute("login/v2"), {
        ...router.query,
        showAutoLogoutInfo: "1",
      }),
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
            setModal(false);
            signingFailure(res.message || "Ada yang salah");
          }
        }
      })
      .catch((err) => {
        setIsFRSuccess(false);
        toast.dismiss("info");
        if (err.response?.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_v2") });
          removeStorageWithExpiresIn("token_v2");
          localStorage.removeItem("refresh_token_v2");
          router.replace({
            pathname: handleRoute("login/v2"),
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
            setModal(false);
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

  const { t }: any = i18n;

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        <>
          <Heading className="block text-center">
            {t("frTitle")}
          </Heading>
          <Paragraph size="sm" className="mt-2 block text-center">
            {t("frSubtitle1")}
          </Paragraph>
          <FRCamera
            setModal={setModal}
            setIsFRSuccess={setIsFRSuccess}
            signingFailedRedirectTo={handleRoute("login/v2")}
            tokenIdentifier="token_v2"
            countIdentifier="count_v2"
            callbackCaptureProcessor={captureProcessor}
            countdownRepeatDelay={5}
          />
          <Button
            onClick={() => setModal(!modal)}
            size="none"
            className="mt-3 mb-1 uppercase font-bold text-base h-9"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
          >
            {t("cancel")}
          </Button>
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
  const [timeRemaining, setTimeRemaining] = useState<string>("0");
  const [isCountDone, setIsCountDone] = useState<boolean>(false);
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const [values, setValues] = useState(["", "", "", "", "", ""]);

  const { t }: any = i18n;

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
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });
    RestSigningAuthPIN({
      payload: {
        otp_pin: values.join(""),
        id: routerQuery.id as string,
        user: routerQuery.user as string,
        async: routerQuery.async as string,
      },
      token: getStorageWithExpiresIn("token_v2", handleRoute("login/v2"), {
        ...router.query,
        showAutoLogoutInfo: "1",
      }),
    })
      .then((res) => {
        if (res.success) {
          setSuccessSigning(true);
          toast.dismiss("loading");
          localStorage.setItem("count_v2", "0");
          setEndTimeToZero();
        } else {
          setSuccessSigning(false);
          toast.dismiss("loading");
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
            setModal(false);
            signingFailure(res.message || "Ada yang salah");
            setEndTimeToZero();
          }
        }
      })
      .catch((err) => {
        setSuccessSigning(false);
        toast.dismiss("loading");
        setValues(["", "", "", "", "", ""]);
        if (err.response?.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_v2") });
          removeStorageWithExpiresIn("token_v2");
          localStorage.removeItem("refresh_token_v2");
          router.replace({
            pathname: handleRoute("login/v2"),
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
            setModal(false);
            signingFailure(err.response?.data?.message || "Ada yang salah");
            setEndTimeToZero();
          }
        }
      });
  };

  const interval = 60000;
  const reset = () => {
    localStorage.endTime = +new Date() + interval;
  };

  const setEndTimeToZero = () => {
    localStorage.endTime = "0";
  };

  const timerHandler = () => {
    setInterval(function () {
      const date: any = new Date();
      const remaining = localStorage.endTime - date;
      const timeRemaining = Math.floor(remaining / 1000).toString();
      if (remaining >= 1) {
        setTimeRemaining(timeRemaining);
      } else {
        setIsCountDone(false);
      }
    }, 100);
  };

  const handleTriggerSendOTP = () => {
    restGetOtp({
      token: getStorageWithExpiresIn("token_v2", handleRoute("login/v2"), {
        ...router.query,
        showAutoLogoutInfo: "1",
      }),
    })
      .then((res) => {
        if (res.success) {
          timerHandler();
          reset();
          setIsCountDone(true);
          toast(`Kode OTP telah dikirim ke Email anda`, {
            type: "info",
            toastId: "info",
            isLoading: false,
            position: "top-center",
            style: {
              backgroundColor: themeConfiguration?.data.toast_color as string,
            },
          });
        } else {
          toast.error(res.message, {
            icon: <XIcon />,
          });
        }
      })
      .catch((err) => {
        if (err?.request?.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_v2") });
          removeStorageWithExpiresIn("token_v2");
          localStorage.removeItem("refresh_token_v2");
          router.replace({
            pathname: handleRoute("login/v2"),
            query: { ...router.query, showAutoLogoutInfo: "1" },
          });
        } else {
          toast.error("Kode OTP gagal dikirim", {
            icon: <XIcon />,
          });
        }
      });
  };

  useEffect(() => {
    if (modal && !successSigning && !isCountDone && timeRemaining === "0") {
      handleTriggerSendOTP();
    } else {
      setIsCountDone(true);
      timerHandler();
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
          <Heading className="block text-center pb-5  whitespace-nowrap">
            {t("frTitle")}
          </Heading>
          <Paragraph className="block text-center pb-5  ">
            {t("frSubtitle2")}
          </Paragraph>
          <PinInput
            containerStyle={{
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              marginTop: "10px",
            }}
            inputStyle={{ alignItems: "center", gap: 5, marginTop: "10px" }}
            placeholder=""
            size="lg"
            values={values}
            onChange={(value, index, values) => setValues(values)}
          />
          <div className="flex justify-center text-sm gap-1 mt-5">
            <Paragraph>{t("dindtReceiveOtp")}</Paragraph>
            <div
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
              className="font-semibold"
            >
              {!isCountDone ? (
                <Button
                  variant="ghost"
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className="mx-0"
                  size="none"
                  onClick={handleTriggerSendOTP}
                >
                  {t("resend")}
                </Button>
              ) : (
                `0:${timeRemaining}`
              )}
            </div>
          </div>
          <Button
            disabled={values.join("").length < 6}
            onClick={onClickHandler}
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
            className="mt-16 block mx-auto py-3"
            size="lg"
          >
            {t("confirm")}
          </Button>
          <Button
            onClick={() => {
              setValues(["", "", "", "", "", ""]);
              setModal(!modal);
            }}
            className="font-semibold mt-2"
            variant="ghost"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

const ViewerModal: React.FC<IModalViewer> = ({ modal, onClose, viewedDoc }) => {
  const { t }: any = i18n;

  const [totalPages, setTotalPages] = useState<number>(0);
  const [closeButtonShouldDisabled, setCloseButtonShouldDisabled] =
    useState<boolean>(true);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const handleScroll = (e: any) => {
    const scrollDiv: HTMLDivElement | null =
      document.querySelector("#scrollDiv");

    const bottom =
      e.target.scrollHeight - Math.ceil(e.target.scrollTop) ===
      e.target.clientHeight;

    const scrollTop = Math.round(e.target.scrollTop);
    const scrollHeight = Math.round(
      e.target.scrollHeight - e.target.offsetHeight
    );

    if (
      scrollTop === scrollHeight ||
      scrollTop - 4 === scrollHeight ||
      bottom
    ) {
      setCloseButtonShouldDisabled(false);
      if (scrollDiv) {
        scrollDiv.style.borderBottomWidth = "4px";
        scrollDiv.style.borderColor = "#DFE1E6";
      }
    }
  };

  useEffect(() => {
    const bodyEl = document.querySelector("body");
    if (!modal || !bodyEl) {
      return;
    } else {
      bodyEl.style.overflow = "hidden";
    }

    return () => {
      bodyEl.style.overflow = "unset";
    };
  }, [modal]);

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-center transition-all duration-1000 justify-center left-0 top-0 w-full h-screen"
    >
      <div className="bg-white max-w-md my-6 mx-5 rounded-xl w-full">
        <p className="text-center font-semibold text-base text-neutral800 pt-4 px-8 pb-3 border-b border-neutral40 truncate">
          {viewedDoc?.pdfName}
        </p>
        <div
          id="scrollDiv"
          className="overflow-y-scroll pb-4"
          style={{ maxHeight: "64vh" }}
          onScroll={handleScroll}
        >
          <ViewerV2
            setTotalPages={setTotalPages}
            url={`{data:application/pdf;base64,${viewedDoc?.pdfBase64}`}
            tandaTangan={null}
          />
        </div>
        <div className="px-2 py-3 flex justify-center">
          <Button
            disabled={closeButtonShouldDisabled}
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
            onClick={() => {
              onClose();
              setCloseButtonShouldDisabled(true);
            }}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Signing;
