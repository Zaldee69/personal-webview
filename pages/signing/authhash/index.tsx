import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  getCertificateList,
  getUserName,
  restGetOtp,
  restLogout,
} from "infrastructure/rest/b2b";
import Footer from "@/components/Footer";
import EyeIcon from "@/public/icons/EyeIcon";
import EyeIconOff from "@/public/icons/EyeIconOff";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/loginSlice";
import { TLoginInitialState, TLoginProps } from "@/interface/interface";
import Head from "next/head";
import toastCaller from "@/utils/toastCaller";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { useRouter } from "next/router";
import { handleRoute } from "../../../utils/handleRoute";
import Image from "next/image";
import { assetPrefix } from "../../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import i18n from "i18";
import {
  getStorageWithExpiresIn,
  removeStorageWithExpiresIn,
  setStorageWithExpiresIn,
} from "@/utils/localStorageWithExpiresIn";
import { getExpFromToken } from "@/utils/getExpFromToken";
import Link from "next/link";
import { PinInput } from "react-input-pin-code";
import { RestSigningAuthhashsign } from "infrastructure";
import FRCamera from "@/components/FRCamera";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import Button, { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";

interface IPropsLogin {}

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
  callbackFailure: (siginingFailureError: {
    message: string;
    status: string;
  }) => void;
  tilakaName?: string;
}

const AUTHHASH_PATHNAME = handleRoute("signing/authhash");

const FRModal: React.FC<IModal> = ({
  modal,
  setModal,
  callbackSuccess,
  callbackFailure,
}) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const signingFailure = (message: string) => {
    callbackFailure({ message, status: "Gagal" });
  };
  const captureProcessor = (base64Img: string | null | undefined) => {
    RestSigningAuthhashsign({
      params: {
        id: routerQuery.id as string,
        user: routerQuery.user as string,
      },
      payload: {
        face_image: base64Img?.split(",")[1] as string,
      },
      token: getStorageWithExpiresIn("token_hashsign", AUTHHASH_PATHNAME, {
        ...router.query,
        showAutoLogoutInfo: "1",
      }),
    })
      .then((res) => {
        if (res.success) {
          localStorage.setItem("count_hashsign", "0");
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
            parseInt(localStorage.getItem("count_hashsign") as string) + 1;
          localStorage.setItem("count_hashsign", newCount.toString());
          const count = parseInt(
            localStorage.getItem("count_hashsign") as string
          );
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
        if (err.response?.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_hashsign") });
          removeStorageWithExpiresIn("token_hashsign");
          localStorage.removeItem("refresh_token_hashsign");
          router.replace({
            pathname: AUTHHASH_PATHNAME,
            query: { ...router.query, showAutoLogoutInfo: "1" },
          });
        } else {
          toast.error(err.response?.data?.message || "Wajah tidak cocok", {
            icon: <XIcon />,
          });
          const newCount =
            parseInt(localStorage.getItem("count_hashsign") as string) + 1;
          localStorage.setItem("count_hashsign", newCount.toString());
          const count = parseInt(
            localStorage.getItem("count_hashsign") as string
          );
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

  const { t }: any = i18n;

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
            signingFailedRedirectTo={AUTHHASH_PATHNAME}
            tokenIdentifier="token_hashsign"
            countIdentifier="count_hashsign"
            callbackCaptureProcessor={captureProcessor}
          />
          <Button
            onClick={() => setModal(!modal)}
            size="full"
            className="mt-5 uppercase text-base mb-2 font-medium h-9"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
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
}) => {
  const [successSigning, setSuccessSigning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("0");
  const [isCountDone, setIsCountDone] = useState<boolean>(false);
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;

  const [values, setValues] = useState(["", "", "", "", "", ""]);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  const signingFailure = (message: string) => {
    callbackFailure({ message, status: "Gagal" });
  };
  const onClickHandler = () => {
    toast(`Loading...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toastColor as string,
      },
    });
    RestSigningAuthhashsign({
      params: {
        id: routerQuery.id as string,
        user: routerQuery.user as string,
      },
      payload: {
        otp_pin: values.join(""),
      },
      token: getStorageWithExpiresIn("token_hashsign", AUTHHASH_PATHNAME, {
        ...router.query,
        showAutoLogoutInfo: "1",
      }),
    })
      .then((res) => {
        if (res.success) {
          setSuccessSigning(true);
          toast.dismiss("loading");
          localStorage.setItem("count_hashsign", "0");
          setEndTimeToZero();
        } else {
          setSuccessSigning(false);
          toast.dismiss("loading");
          setModal(false);
          setValues(["", "", "", "", "", ""]);
          toast.error(res.message || "Ada yang salah", { icon: <XIcon /> });
          const newCount =
            parseInt(localStorage.getItem("count_hashsign") as string) + 1;
          localStorage.setItem("count_hashsign", newCount.toString());
          const count = parseInt(
            localStorage.getItem("count_hashsign") as string
          );
          if (
            count >= 5 ||
            res.message.toLowerCase() ===
              "penandatanganan dokumen gagal. gagal FR sudah 5 kali".toLocaleLowerCase()
          ) {
            signingFailure(res.message || "Ada yang salah");
            setEndTimeToZero();
          }
        }
      })
      .catch((err) => {
        setSuccessSigning(false);
        toast.dismiss("loading");
        setModal(false);
        setValues(["", "", "", "", "", ""]);
        if (err.response?.status === 401) {
          restLogout({ token: localStorage.getItem("refresh_token_hashsign") });
          removeStorageWithExpiresIn("token_hashsign");
          localStorage.removeItem("refresh_token_hashsign");
          router.replace({
            pathname: AUTHHASH_PATHNAME,
            query: { ...router.query, showAutoLogoutInfo: "1" },
          });
        } else {
          toast.error(err.response?.data?.message || t("otpInvalid"), {
            icon: <XIcon />,
          });
          setValues(["", "", "", "", "", ""]);
          const newCount =
            parseInt(localStorage.getItem("count_hashsign") as string) + 1;
          localStorage.setItem("count_hashsign", newCount.toString());
          const count = parseInt(
            localStorage.getItem("count_hashsign") as string
          );
          if (count >= 5) {
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
      token: getStorageWithExpiresIn("token_hashsign", AUTHHASH_PATHNAME, {
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
              backgroundColor: themeConfiguration?.data.toastColor as string,
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
          restLogout({ token: localStorage.getItem("refresh_token_hashsign") });
          removeStorageWithExpiresIn("token_hashsign");
          localStorage.removeItem("refresh_token_hashsign");
          router.replace({
            pathname: AUTHHASH_PATHNAME,
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
          <p className="font-poppins block text-center pb-5  whitespace-nowrap  font-semibold ">
            {t("frTitle")}
          </p>
          <span className="font-poppins block text-center pb-5  ">
            {t("frSubtitle2")}
          </span>
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
          <div className="flex font-poppins justify-center text-sm gap-1 mt-5">
            <p className="text-neutral200">{t("dindtReceiveOtp")}</p>
            <div
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.actionFontColor as string
                ),
              }}
              className="font-semibold"
            >
              {!isCountDone ? (
                <Button
                  variant="ghost"
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.actionFontColor as string
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
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
              ),
            }}
            disabled={values.join("").length < 6}
            onClick={onClickHandler}
            className="mt-16 py-3"
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
                themeConfiguration?.data.actionFontColor as string
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

const SigningSuccess = () => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const params = {
    user_identifier: routerQuery.user,
    request_id: routerQuery.request_id,
    status: "Sukses",
  };
  const queryString = new URLSearchParams(params as any).toString();

  const { t }: any = i18n;

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
        <p className="font-poppins text-lg font-semibold text-neutral800">
          {t("authenticationSuccessTitle")}
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
          <p className="font-poppins text-sm whitespace-pre-line text-neutral800">
            {t("authenticationSuccessSubtitle")}
          </p>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <a
            href={concateRedirectUrlParams(
              routerQuery.redirect_url,
              queryString
            )}
          >
            <span
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.actionFontColor as string
                ),
              }}
              className={buttonVariants({
                variant: "link",
                size: "none",
                className: "font-medium",
              })}
            >
              {t("livenessSuccessButtonTitle")}
            </span>
          </a>
        )}
        <Footer />
      </div>
    </div>
  );
};

const SigningFailure = () => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const params = {
    user_identifier: routerQuery.user,
    id: routerQuery.id,
  };
  const queryString = new URLSearchParams(params as any).toString();
  const { t }: any = i18n;

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
            {t("signFailedSubtitle")}{" "}
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
              <span
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.actionFontColor as string
                  ),
                }}
                className={buttonVariants({
                  variant: "link",
                  size: "none",
                  className: "font-medium",
                })}
              >
                {t("livenessSuccessButtonTitle")}
              </span>
            </a>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

const Login = ({}: IPropsLogin) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.login);
  const [password, setPassword] = useState<string>("");
  const [tilakaName, setTilakaName] = useState("");
  const [type, setType] = useState<{ password: string }>({
    password: "password",
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<"-1" | "0" | "1">("-1");

  const {
    channel_id,
    user,
    id,
  }: NextParsedUrlQuery & {
    redirect_url?: string;
    showAutoLogoutInfo?: string;
  } & IParameterFromRequestSign = router.query;
  const { t }: any = i18n;

  useEffect(() => {
    if (!router.isReady) return;
    setTilakaName(user as string);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (isSubmitted && data.status === "FULLFILLED" && data.data.success) {
      localStorage.setItem("count_hashsign", "0");
      setStorageWithExpiresIn(
        "token_hashsign",
        data.data.data[0],
        getExpFromToken(data.data.data[0]) as number
      );

      localStorage.setItem(
        "refresh_token_hashsign",
        data.data.data[1] as string
      );

      doIn(data);

      toastCaller(data, themeConfiguration?.data.toastColor as string);
    } else if (data.status === "FULLFILLED" && !data.data.success) {
      toast(data.data.message || "Ada kesalahan", {
        type: "error",
        toastId: "error",
        position: "top-center",
        icon: XIcon,
      });
    }
  }, [data.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const doIn = (data?: TLoginInitialState): void => {
    let queryWithDynamicRedirectURL = {
      ...router.query,
    };

    const token_hashsign = getStorageWithExpiresIn(
      "token_hashsign",
      handleRoute("signing/authhash"),
      {
        ...queryWithDynamicRedirectURL,
        showAutoLogoutInfo: "1",
      }
    );

    getCertificateList({
      token: token_hashsign,
    }).then((res) => {
      const certif = JSON.parse(res.data);
      if (!id) {
        toast.dismiss("success");
        toast("ID tidak boleh kosong", {
          type: "error",
          toastId: "error",
          position: "top-center",
          icon: XIcon,
        });
      } else {
        if (certif[0].status == "Aktif") {
          // router.replace({
          //   pathname: handleRoute("signing/v2"),
          //   query: {
          //     ...queryWithDynamicRedirectURL,
          //   },
          // });
          //
          //
          //
          //
          // mfa ->
          // hit /authhashsign ->
          // hapus token dari localStorage with removeStorageWithExpiresIn ->
          // halaman hasil (berhasil/gagal)

          getUserName({ token: token_hashsign })
            .then((res) => {
              if (res.success) {
                const data = JSON.parse(res.data);
                // "FR" | "OTP" | null
                if (data.typeMfa === "FR") {
                  setopenFRModal(true);
                } else {
                  setOtpModal(true);
                }
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
                  token: localStorage.getItem("refresh_token_hashsign"),
                });
                removeStorageWithExpiresIn("token_hashsign");
                localStorage.removeItem("refresh_token_hashsign");
                router.replace({
                  pathname: AUTHHASH_PATHNAME,
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
        }
      }
    });
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const submitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      login({
        password,
        tilaka_name: user,
        channel_id: channel_id,
      } as TLoginProps)
    );
    setPassword("");
    setIsSubmitted(true);
  };

  const handleShowPwd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setType((prev) => ({
      ...prev,
      password: type.password === "password" ? "text" : "password",
    }));
  };

  const mfaCallbackSuccess = () => {
    setIsSuccess("1");
    removeStorageWithExpiresIn("token_hashsign");
    localStorage.removeItem("refresh_token_hashsign");
  };

  const mfaCallbackFailure = () => {
    setIsSuccess("0");
    removeStorageWithExpiresIn("token_hashsign");
    localStorage.removeItem("refresh_token_hashsign");
  };

  if (isSuccess === "1") {
    return <SigningSuccess />;
  } else if (isSuccess === "0") {
    return <SigningFailure />;
  }

  return (
    <div
      className="h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
    >
      <Head>
        <title>Tilaka</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className="px-5 pt-8 max-w-screen-sm sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-5 mt-10 items-center">
          <div className="h-14 w-14 font-semibold flex  text-xl items-center justify-center name text-white bg-[#64bac3] rounded-full">
            {tilakaName?.[0]?.toUpperCase()}
          </div>
          <span className="font-bold text-xl text-[#172b4d] font-poppins">
            {t("hi")}, {user}
          </span>
        </div>
        <form onSubmit={submitHandler}>
          <div className="flex flex-col  mt-20">
            <label
              className="font-poppins px-2 text-label font-light"
              htmlFor="password"
            >
              {t("passwordLabel")}
            </label>
            <div className="relative flex-1">
              <input
                onChange={(e) => onChangeHandler(e)}
                value={password}
                name="password"
                type={type.password}
                placeholder={t("passwordPlaceholder")}
                className={`font-poppins py-3 focus:outline-none border-borderColor focus:ring  placeholder:text-placeholder placeholder:font-light px-2 rounded-md border w-full`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={(e) => handleShowPwd(e)}
                className="absolute right-3 top-3"
              >
                {type.password === "password" ? <EyeIcon /> : <EyeIconOff />}
              </button>
            </div>
            <div className="flex justify-center items-center mt-5">
              <Link
                href={{
                  pathname: handleRoute("forgot-password"),
                  // query: { redirect_url: getEncodedCurrentUrl() },
                }}
                passHref
              >
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.actionFontColor as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotPasswordButton")}
                </a>
              </Link>
              <div className="block mx-2.5">
                <Image
                  src={`${assetPrefix}/images/lineVertical.svg`}
                  width="8px"
                  height="24px"
                  alt="lineVertical"
                />
              </div>
              <Link href={handleRoute("forgot-tilaka-name")} passHref>
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.actionFontColor as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotTilakaName")}
                </a>
              </Link>
            </div>
          </div>
          {/* <Button
           style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.buttonColor as string
            ),
          }}
          className="uppercase mt-24"
            type="submit"
            disabled={password.length < 1}
          >
            {t("loginCTA")}
          </Button> */}
          <Button
            type="submit"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
              ),
            }}
            className="uppercase mt-24 text-white"
            disabled={password.length < 1}
          >
            {t("loginCTA")}
          </Button>
        </form>

        <Footer />

        <FRModal
          modal={openFRModal}
          setModal={setopenFRModal}
          callbackSuccess={mfaCallbackSuccess}
          callbackFailure={mfaCallbackFailure}
        />
        <OTPModal
          modal={otpModal}
          setModal={setOtpModal}
          callbackSuccess={mfaCallbackSuccess}
          callbackFailure={mfaCallbackFailure}
        />
      </div>
    </div>
  );
};

export default Login;
