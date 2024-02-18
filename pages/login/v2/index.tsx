import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
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
import { handleRoute } from "./../../../utils/handleRoute";
import Image from "next/legacy/image";
import { assetPrefix } from "../../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import i18n from "i18";
import { GetServerSideProps } from "next";
import Loading from "@/components/Loading";
import {
  getStorageWithExpiresIn,
  removeStorageWithExpiresIn,
  setStorageWithExpiresIn,
} from "@/utils/localStorageWithExpiresIn";
import { getExpFromToken } from "@/utils/getExpFromToken";
import Link from "next/link";
import { getEncodedCurrentUrl } from "@/utils/getEncodedCurrentUrl";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Button, { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Paragraph from "@/components/atoms/Paraghraph";

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
}

type ModalProps = {
  certifModal: boolean;
  setCertifModal: React.Dispatch<React.SetStateAction<boolean>>;
};

type TEventMessageDataToken = string | undefined;

const loginQueueInitial = { queue: false, data: { existingToken: undefined } };

const Login = ({}: IPropsLogin) => {
  const [password, setPassword] = useState<string>("");
  const [tilakaName, setTilakaName] = useState("");
  const [certifModal, setCertifModal] = useState<boolean>(false);
  const [type, setType] = useState<{ password: string }>({
    password: "password",
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [autoLogoutModal, setAutoLogoutModal] = useState<boolean>(false);
  const [loginQueue, setLoginQueue] = useState<{
    queue: boolean;
    data: { existingToken: TEventMessageDataToken };
  }>(loginQueueInitial);
  const [doInAuto, setDoInAuto] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.login);
  const router = useRouter();
  const {
    channel_id,
    user,
    id,
    showAutoLogoutInfo,
  }: NextParsedUrlQuery & {
    redirect_url?: string;
    showAutoLogoutInfo?: string;
  } & IParameterFromRequestSign = router.query;

  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (router.isReady) {
      setTilakaName(user as string);
      if (showAutoLogoutInfo === "1") {
        setAutoLogoutModal(true);
      }

      const token = localStorage.getItem("token");

      if (token) {
        const queryString = window.location.search;

        window.location.replace(handleRoute(`signing/v2/${queryString}`));
      }
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isSubmitted && data.status === "FULLFILLED" && data.data.success) {
      localStorage.setItem("count_v2", "0");

      doIn(data);
    }
    toastCaller(data, themeConfiguration?.data.toast_color as string);
  }, [data.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMe", true as any);
    } else {
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe]);

  useEffect(() => {
    const parentWindow = window.parent;

    const receiveMessage = (event: MessageEvent) => {
      const dataToken = event.data.token;
      const existingToken: TEventMessageDataToken =
        dataToken || getStorageWithExpiresIn("token_v2");

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
    }

    getCertificateList().then((res) => {
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
          router.replace({
            pathname: handleRoute("signing/v2"),
            query: {
              ...queryWithDynamicRedirectURL,
              login_from: "login/v2",
            },
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
              v2: "1",
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
        tilaka_name: user,
        channel_id: channel_id,
        remember: rememberMe,
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

  if (doInAuto && loginQueue.queue) {
    return (
      <LoginQueue
        existingToken={loginQueue.data.existingToken}
        setLoginQueue={setLoginQueue}
        doIn={doIn}
      />
    );
  }

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
      <CertifModal setCertifModal={setCertifModal} certifModal={certifModal} />
      <AutoLogoutInfoModal
        modal={autoLogoutModal}
        setModal={setAutoLogoutModal}
      />
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
              >
                <p
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
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
                rel="noopener noreferrer"
                passHref
                target="_blank"
              >
                <p
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
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
                  themeConfiguration?.data.button_color as string
                ),
              }}
              className="uppercase mt-24 text-white"
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
  return { props: {} };
};

export default Login;

const CertifModal = ({ certifModal, setCertifModal }: ModalProps) => {
  const { t }: any = i18n;
  return certifModal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-xl w-full mx-5">
        <Heading className="text-center">{t("dontHaveCertifTitle")}</Heading>
        <div className="flex flex-col justify-center">
          <Image
            src={`${assetPrefix}/images/certif.svg`}
            width={100}
            height={100}
            alt="cert"
          />
          <Paragraph className="text-center mt-5">
            {t("dontHaveCertifSubtitle")}
          </Paragraph>
        </div>
        <button className="bg-primary btn uppercase mt-8 disabled:opacity-50 text-white font-poppins w-full mx-auto rounded-sm h-9">
          {t("createNewCertif")}
        </button>
        <button
          onClick={() => {
            // restLogout({})
            setCertifModal(false);
          }}
          className="  text-[#97A0AF] uppercase font-poppins w-full mt-4 mx-auto rounded-sm h-9"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  ) : null;
};

const AutoLogoutInfoModal: React.FC<IModal> = ({ modal, setModal }) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    showAutoLogoutInfo?: string;
  } & IParameterFromRequestSign = router.query;
  const { showAutoLogoutInfo, ...restRouterQuery } = routerQuery;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const onClose = () => {
    setModal(false);
    router.replace({
      pathname: handleRoute("login/v2"),
      query: { ...restRouterQuery },
    });
  };
  const { t }: any = i18n;

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-sm mt-20 pt-6 px-3 pb-3 rounded-xl w-full mx-5">
        <div className="flex flex-col">
          <Heading className="text-center">{t("youAreLoggedOut")}</Heading>
          <div className="flex justify-center">
            <Image
              src={`${assetPrefix}/images/autoLogout.svg`}
              width="95"
              height="95"
              alt="auto-logout-ill"
            />
          </div>
          <Paragraph className="text-center px-3 mt-2.5 mx-auto">
            {t("relogin1")}
            <br /> {t("relogin2")}
          </Paragraph>
          <Button
            variant="ghost"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
            onClick={onClose}
            className="text-primary font-poppins mt-4 hover:opacity-50 mx-auto rounded-sm font-semibold p-4 text-sm"
          >
            {t("close")}
          </Button>
        </div>
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
    removeStorageWithExpiresIn("token_v2");
    localStorage.removeItem("refresh_token_v2");
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
