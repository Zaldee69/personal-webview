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
import Image from "next/legacy/image";
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
import Button, { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Paragraph from "@/components/atoms/Paraghraph";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";

interface IPropsLogin {}

export interface IParameterFromRequestSign {
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

const FRModal: React.FC<IModal> = ({ modal, setModal, callbackFailure }) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

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
          router.replace({
            pathname: handleRoute("signing/success"),
            query: {
              redirect_url: routerQuery.redirect_url,
              user_identifier: res.data.tilaka_name,
              request_id: res.data.request_id,
              status: "Sukses",
            },
          });
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
          if (
            res.message.toLowerCase() ===
              "authhashsign gagal. gagal FR sudah 5 kali".toLocaleLowerCase() ||
            res.message === "signing sudah selesai"
          ) {
            router.push(
              {
                pathname: handleRoute("signing/failure"),
                query: {
                  redirect_url: routerQuery.redirect_url,
                  user_identifier: routerQuery.user,
                  request_id: res.data.request_id,
                  status: "Gagal",
                },
              },
              undefined,
              { shallow: false }
            );
            setModal(false);
          }
        }
      })
      .catch((err) => {
        setIsFRSuccess(false);
        toast.dismiss("info");
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
          if (
            err.response?.data?.message?.toLowerCase() ===
            "authhashsign gagal. gagal FR sudah 5 kali".toLocaleLowerCase()
          ) {
            setModal(false);
          }
        }
      });
  };

  useEffect(() => {
    if (isFRSuccess) {
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
            callbackCaptureProcessor={captureProcessor}
            countdownRepeatDelay={5}
          />
          <Button
            onClick={() => setModal(!modal)}
            size="none"
            className="mt-3 uppercase text-base font-bold h-9"
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
        backgroundColor: themeConfiguration?.data.toast_color as string,
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
          router.push(
            {
              pathname: handleRoute("/signing/success"),
              query: {
                redirect_url: routerQuery.redirect_url,
                user_identifier: routerQuery.user,
                request_id: res.data.request_id,
                status: "Sukses",
              },
            },
            undefined,
            { shallow: true }
          );
          setSuccessSigning(true);
          toast.dismiss("loading");
          setEndTimeToZero();
        } else {
          setSuccessSigning(false);
          toast.dismiss("loading");
          setValues(["", "", "", "", "", ""]);
          toast.error(res.message || "Ada yang salah", { icon: <XIcon /> });

          if (
            res.message.toLowerCase() ===
            "authhashsign gagal. salah OTP sudah 5 kali".toLocaleLowerCase()
          ) {
            router.push(
              {
                pathname: handleRoute("/signing/failure"),
                query: {
                  redirect_url: routerQuery.redirect_url,
                  user_identifier: routerQuery.user,
                  request_id: res.data.request_id,
                  status: "Gagal",
                },
              },
              undefined,
              { shallow: true }
            );
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
          if (
            err.response?.data?.message?.toLowerCase() ===
            "authhashsign gagal. salah OTP sudah 5 kali".toLocaleLowerCase()
          ) {
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
          <Heading className="block text-center pb-5  whitespace-nowrap">
            {t("frTitle")}
          </Heading>
          <Paragraph className="block text-center pb-5">
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
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
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
    }
    toastCaller(data, themeConfiguration?.data.toast_color as string);
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

  return (
    <div
      className="min-h-screen"
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
          <Heading size="md">
            {t("hi")}, {user}
          </Heading>
        </div>
        <form onSubmit={submitHandler}>
          <div className="flex flex-col  mt-20">
            <Label size="base" className="px-2" htmlFor="password">
              {t("passwordLabel")}
            </Label>
            <div className="relative flex-1">
              <input
                onChange={(e) => onChangeHandler(e)}
                value={password}
                name="password"
                type={type.password}
                placeholder={t("passwordPlaceholder")}
                className={`py-3 focus:outline-none border-borderColor focus:ring   placeholder:font-light px-2 rounded-md border w-full`}
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
                  query: router.query,
                }}
                passHref
                legacyBehavior
              >
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
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
                  width="8"
                  height="24"
                  alt="lineVertical"
                />
              </div>
              <Link
                href={{
                  pathname: handleRoute("forgot-tilaka-name"),
                  query: router.query,
                }}
                passHref
                legacyBehavior
              >
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotTilakaName")}
                </a>
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
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
