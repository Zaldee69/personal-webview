import React, { useState, useEffect, useCallback } from "react";
import { getCertificateList, getUserName } from "infrastructure/rest/b2b";
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
import { handleRoute } from "./../../utils/handleRoute";
import Image from "next/image";
import { assetPrefix } from "../../next.config";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import i18n from "i18";
import Loading from "@/components/Loading";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import {
  getStorageWithExpiresIn,
  removeStorageWithExpiresIn,
  setStorageWithExpiresIn,
} from "@/utils/localStorageWithExpiresIn";
import { getExpFromToken } from "@/utils/getExpFromToken";
import Link from "next/link";
import { getEncodedCurrentUrl } from "@/utils/getEncodedCurrentUrl";
import Button, { buttonVariants } from "@/components/atoms/Button";
import { TThemeResponse } from "infrastructure/rest/personal/types";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";

type Props = {};

type ModalProps = {
  certifModal: boolean;
  setCertifModal: React.Dispatch<React.SetStateAction<boolean>>;
  theme: TThemeResponse | undefined;
};

type TEventMessageDataToken = string | undefined;

const loginQueueInitial = { queue: false, data: { existingToken: undefined } };

const Login = ({}: Props) => {
  const [password, setPassword] = useState<string>("");
  const [tilakaName, setTilakaName] = useState("");
  const [certifModal, setCertifModal] = useState<boolean>(false);
  const [type, setType] = useState<{ password: string }>({
    password: "password",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [theme, setTheme] = useState<TThemeResponse>();
  const [loginQueue, setLoginQueue] = useState<{
    queue: boolean;
    data: { existingToken: TEventMessageDataToken };
  }>(loginQueueInitial);
  const [doInAuto, setDoInAuto] = useState<boolean>(false);
  const { t }: any = i18n;
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.login);
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const router = useRouter();
  const { channel_id, tilaka_name, company_id, transaction_id, signing } =
    router.query;

  useEffect(() => {
    if (router.isReady) {
      setTilakaName(tilaka_name as string);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTheme(themeConfiguration);
  }, [themeConfiguration.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the component mounts
  useEffect(() => {
    const rememberMeFlag = localStorage.getItem("rememberMe");
    if (rememberMeFlag) {
      setRememberMe(true);
    }
  }, []);

  // When the state of the "remember me" checkbox changes
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", true as any);
    } else {
      localStorage.removeItem("rememberMe");
      // localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    }
  }, [rememberMe]);

  useEffect(() => {
    if (data.status === "FULLFILLED" && data.data.success) {
      setStorageWithExpiresIn(
        "token",
        data.data.data[0],
        getExpFromToken(data.data.data[0]) as number
      );

      if (rememberMe) {
        setStorageWithExpiresIn(
          "token",
          data.data.data[0],
          getExpFromToken(data.data.data[0]) as number
        );
        localStorage.setItem("refresh_token", data.data.data[1] as string);
      }

      doIn(data);
    }
    toastCaller(data, themeConfiguration?.data.toastColor as string);
  }, [data.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const parentWindow = window.parent;

    const receiveMessage = (event: MessageEvent) => {
      const dataToken = event.data.token;
      const existingToken: TEventMessageDataToken =
        dataToken || getStorageWithExpiresIn("token");

      // rendered by iframe
      if (dataToken) {
        setDoInAuto(true);
      }

      if (existingToken) {
        setLoginQueue({
          queue: true,
          data: { existingToken: existingToken },
        });
      } else {
        setLoginQueue(loginQueueInitial);
      }
    };
    const onLoad = () => {
      parentWindow.postMessage("shakehand", "*");
    };

    window.addEventListener("message", receiveMessage);
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("message", receiveMessage);
      window.removeEventListener("load", onLoad);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doIn = (data?: TLoginInitialState): void => {
    let queryWithDynamicRedirectURL = {
      ...router.query,
    };

    if (data) {
      setDoInAuto(false);

      if (data.data.message.length > 0) {
        queryWithDynamicRedirectURL["redirect_url"] = data.data.message;
      }
    }

    getCertificateList({ params: company_id as string }).then((res) => {
      const certif = JSON.parse(res.data);
      if (!transaction_id && signing === "1") {
        toast.dismiss("success");
        toast("Transaction ID tidak boleh kosong", {
          type: "error",
          toastId: "error",
          position: "top-center",
          icon: XIcon,
        });
      } else {
        if (certif[0].status == "Aktif") {
          getUserName({}).then((res) => {
            const data = JSON.parse(res.data);
            if (data.typeMfa == null) {
              router.replace({
                pathname: handleRoute("setting-signature-and-mfa"),
                query: {
                  ...queryWithDynamicRedirectURL,
                },
              });
            } else if (router.query.setting === "2") {
              router.replace({
                pathname: handleRoute("set-mfa"),
                query: {
                  ...queryWithDynamicRedirectURL,
                },
              });
            }else if(router.query.setting === "3"){
              router.replace({
                pathname: handleRoute("setting-signature"),
                query: {
                  ...queryWithDynamicRedirectURL,
                },
              });
            } else {
              router.replace({
                pathname: handleRoute("signing"),
                query: {
                  ...queryWithDynamicRedirectURL,
                },
              });
            }
          });
        } else if (
          certif[0].status === "Revoke" ||
          certif[0].status === "Expired" ||
          certif[0].status === "Enroll"
        ) {
          setCertifModal(true);
        } else {
          router.replace({
            pathname: handleRoute("certificate-information"),
            query: {
              ...queryWithDynamicRedirectURL,
            },
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
        channel_id,
        tilaka_name,
        company_id,
        transaction_id,
      } as TLoginProps)
    );
    setPassword("");
  };

  const handleShowPwd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setType((prev) => ({
      ...prev,
      password: type.password === "password" ? "text" : "password",
    }));
  };

  if (doInAuto && loginQueue.queue) {
    return (
      <LoginQueue
        existingToken={loginQueue.data.existingToken}
        setLoginQueue={setLoginQueue}
        doIn={doIn}
      />
    );
  }

  if (themeConfiguration.status === "PENDING") return null;

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
      <CertifModal
        setCertifModal={setCertifModal}
        certifModal={certifModal}
        theme={theme}
      />
      <Head>
        <title>Tilaka</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-screen-sm sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-5 mt-10 items-center">
          <div className="h-14 w-14 poppins-semibold flex text-xl items-center justify-center name text-white bg-[#64bac3] rounded-full">
            {tilakaName?.[0]?.toUpperCase()}
          </div>
          <span className="font-bold text-xl text-[#172b4d] poppins-regular">
            {t("hi")}, {tilaka_name}
          </span>
        </div>
        <form onSubmit={submitHandler}>
          <div className="flex flex-col  mt-20">
            <label
              className="poppins-regular px-2 text-label font-light"
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
                className={`poppins-regular py-3 focus:outline-none border-borderColor focus:ring  placeholder:text-placeholder placeholder:font-light px-2 rounded-md border w-full`}
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
            {/* add remember me check box button */}
            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                className="mr-2"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label
                className="poppins-regular text-label font-light"
                htmlFor="rememberMe"
              >
                {t("rememberMe")}
              </label>
            </div>
            <div className="flex justify-center items-center mt-5">
              <Link
                href={{
                  pathname: handleRoute("forgot-password"),
                  query: router.query,
                }}
                passHref
              >
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      theme?.data.actionFontColor as string
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
              <Link href={{
                pathname: handleRoute("forgot-tilaka-name"),
                query: router.query
              }} passHref>
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      theme?.data.actionFontColor as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotTilakaName")}
                </a>
              </Link>
            </div>
          </div>
          <div className="flex justify-center" >
          <Button
            type="submit"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                theme?.data.buttonColor as string
              ),
            }}
            className="uppercase mt-24"
            disabled={password.length < 1}
          >
            {t("loginCTA")}
          </Button>
          </div>
        </form>
        <Footer />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;
  const isNotRedirect: boolean = true;

  const checkStepResult: {
    res?: TKycCheckStepResponseData;
    err?: {
      response: {
        data: {
          success: boolean;
          message: string;
          data: { errors: string[] };
        };
      };
    };
  } = await RestKycCheckStepv2({
    registerId: uuid as string,
  })
    .then((res) => {
      return { res };
    })
    .catch((err) => {
      return { err };
    });

  const serverSideRenderReturnConditionsResult =
    serverSideRenderReturnConditions({
      context,
      checkStepResult,
      isNotRedirect,
    });

  serverSideRenderReturnConditionsResult["props"] = {
    ...serverSideRenderReturnConditionsResult["props"],
  };

  return serverSideRenderReturnConditionsResult;
};

export default Login;

const CertifModal = ({ certifModal, setCertifModal, theme }: ModalProps) => {
  const { t }: any = i18n;
  return certifModal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-4 rounded-xl w-full mx-5">
        <p className="text-center font-poppins font-semibold">
          {t("dontHaveCertifTitle")}
        </p>
        <div className="flex flex-col justify-center">
          <Image
            src={`${assetPrefix}/images/certif.svg`}
            width={100}
            height={100}
            alt="cert"
          />
          <p className="text-center font-poppins mt-5">
            {t("dontHaveCertifSubtitle")}
          </p>
        </div>
        <Button
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              theme?.data.buttonColor as string
            ),
          }}
          size="full"
          className=" mt-8 disabled:opacity-50 text-white h-9"
        >
          {t("createNewCertif")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            // restLogout({})
            setCertifModal(false);
          }}
          className="uppercase w-full mt-4 mx-auto rounded-sm h-9"
          style={{
            color: themeConfigurationAvaliabilityChecker(
              theme?.data.actionFontColor as string
            ),
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  ) : null;
};

type TPropsLoginQueue = {
  existingToken: TEventMessageDataToken;
  setLoginQueue: React.Dispatch<
    React.SetStateAction<{
      queue: boolean;
      data: {
        existingToken: TEventMessageDataToken;
      };
    }>
  >;
  doIn: (data?: TLoginInitialState) => void;
};

const LoginQueue = ({
  existingToken,
  setLoginQueue,
  doIn,
}: TPropsLoginQueue) => {
  const { t }: any = i18n;

  const onLoginFailed = useCallback(() => {
    removeStorageWithExpiresIn("token");
    localStorage.removeItem("refresh_token");
    toast(t("loginQueueErrorText"), {
      type: "error",
      toastId: "error",
      position: "top-center",
      icon: XIcon,
    });
    setTimeout(() => {
      setLoginQueue(loginQueueInitial);
    }, 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // validate token
    getUserName({ token: existingToken })
      .then((_) => {
        // token valid and redirect to authenticated page
        setStorageWithExpiresIn(
          "token",
          existingToken as string,
          getExpFromToken(existingToken as string) as number
        );

        doIn();
      })
      .catch((_) => {
        // should check is err.status equal to 401?
        onLoginFailed();
      });
  }, [existingToken, onLoginFailed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center items-center h-screen pb-20">
        <Loading title={t("loginQueueProcessText")} />
      </div>
      <div className="bg-neutral10 w-full absolute bottom-0 flex justify-center items-center">
        <Image
          src={`${assetPrefix}/images/tilaka-logo.svg`}
          width={100}
          height={100}
          alt="tilaka-logo"
        />
      </div>
    </div>
  );
};
