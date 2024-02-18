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
import Image from "next/legacy/image";
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
import Paragraph from "@/components/atoms/Paraghraph";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Modal from "@/components/modal/Modal";
import { Trans } from "react-i18next";

type Props = {};

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
    const token = localStorage.getItem("token");

    if (token) {
      const queryString = window.location.search;

      if (router.query.setting === "2") {
        window.location.replace(
          handleRoute(`set-mfa/${queryString}&login_from=/login`)
        );
      } else if (router.query.setting === "3") {
        window.location.replace(
          handleRoute(`setting-signature/${queryString}&login_from=/login`)
        );
      }
    }
  }, []);

  useEffect;

  // When the state of the "remember me" checkbox changes
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", true as any);
    } else {
      localStorage.removeItem("rememberMe");
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
    toastCaller(data, themeConfiguration?.data.toast_color as string);
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
      login_from: "login",
    };

    if (data) {
      setDoInAuto(false);
    }

    getCertificateList().then((res) => {
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
          getUserName().then((res) => {
            const data = JSON.parse(res.data);
            const path = "setting-signature-and-mfa";
            if (data.typeMfa == null || router.query.next_path === path) {
              router.replace({
                pathname: handleRoute(path),
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
            } else if (router.query.setting === "3") {
              router.replace({
                pathname: handleRoute("setting-signature"),
                query: {
                  ...queryWithDynamicRedirectURL,
                },
              });
            } else {
              router.replace({
                pathname: handleRoute(router.query.origin as string),
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
      <Modal
        isShowModal={certifModal}
        setModal={setCertifModal}
        headingTitle={t("dontHaveCertifTitle")}
        size="sm"
      >
        <div className="flex flex-col pb-6 px-2 justify-center">
          <div
            className="bg-contain w-32 mx-auto mt-3 h-32 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                theme?.data.asset_activation_cert_error as string,
                "ASSET",
                `${assetPrefix}/images/certif.svg`
              )})`,
            }}
          ></div>
          <Paragraph className="text-center my-5">
            {t("dontHaveCertifSubtitle")}
          </Paragraph>
          <Paragraph size="sm" className="text-center">
            {t("furtherQuestions")}{" "}
            <a
              href="https://tilaka.id/contact/"
              target="_blank"
              className="text-[#4b68af]"
              key={0}
            >
              {t("contactUs")}
            </a>
          </Paragraph>
        </div>
      </Modal>
      <Head>
        <title>Tilaka</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-screen-sm sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-5 mt-10 items-center">
          <div className="h-14 w-14 poppins-semibold flex text-xl items-center justify-center name text-white bg-[#64bac3] rounded-full">
            {tilakaName?.[0]?.toUpperCase()}
          </div>
          <Heading size="md">
            {t("hi")}, {tilaka_name}
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
                className="mr-2 !w-5 !h-5"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <Label size="base" htmlFor="rememberMe">
                {t("rememberMe")}
              </Label>
            </div>
            <div className="flex justify-center items-center mt-5">
              <Link
                href={{
                  pathname: handleRoute("forgot-password"),
                  query: router.query,
                }}
                passHref
                target="_blank"
                rel="noopener noreferrer"
              >
                <p
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      theme?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotPasswordButton")}
                </p>
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
                target="_blank"
                rel="noopener noreferrer"
              >
                <p
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      theme?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({ variant: "ghost", size: "none" })}
                >
                  {t("linkAccountForgotTilakaName")}
                </p>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  theme?.data.button_color as string
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
    getUserName()
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
