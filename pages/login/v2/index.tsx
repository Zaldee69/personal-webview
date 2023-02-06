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
import Image from "next/image";
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
import jwt from "jsonwebtoken";
import { getExpFromToken } from "@/utils/getExpFromToken";

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

  useEffect(() => {
    if (router.isReady) {
      setTilakaName(user as string);
      if (showAutoLogoutInfo === "1") {
        setAutoLogoutModal(true);
      }

      const token = getStorageWithExpiresIn("token_v2");
      const decodedToken = jwt.decode(token as string);

      console.log("decoded token", decodedToken);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isSubmitted && data.status === "FULLFILLED" && data.data.success) {
      localStorage.setItem("count_v2", "0");
      setStorageWithExpiresIn(
        "token_v2",
        data.data.data[0],
        getExpFromToken(data.data.data[0]) as number
      );

      localStorage.setItem("refresh_token_v2", data.data.data[1] as string);

      doIn(data);

      toastCaller(data);
    } else if (data.status === "FULLFILLED" && !data.data.success) {
      toast(data.data.message || "Ada kesalahan", {
        type: "error",
        toastId: "error",
        position: "top-center",
        icon: XIcon,
      });
    }
  }, [data.status]); // eslint-disable-line react-hooks/exhaustive-deps

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

      if (data.data.message.length > 0) {
        queryWithDynamicRedirectURL["redirect_url"] = data.data.message;
      }
    }

    getCertificateList({
      token: getStorageWithExpiresIn("token_v2", handleRoute("login/v2"), {
        ...queryWithDynamicRedirectURL,
        showAutoLogoutInfo: "1",
      }),
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
          router.replace({
            pathname: handleRoute("signing/v2"),
            query: {
              ...queryWithDynamicRedirectURL,
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
    <>
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
            <a
              className="m-5 text-center font-poppins text-primary"
              target="_blank"
              rel="noopener noreferrer"
              href={`${process.env.NEXT_PUBLIC_PORTAL_URL}/public/reset-pass-req.xhtml`}
            >
              {t("linkAccountForgotPasswordButton")}
            </a>
          </div>
          <button
            type="submit"
            disabled={password.length < 1}
            className="bg-primary disabled:opacity-50 mt-32 text-xl uppercase md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-11"
          >
            {t("loginCTA")}
          </button>
        </form>
        <Footer />
      </div>
    </>
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
          <p className="font-poppins text-center font-semibold text-base text-neutral800">
            {t("youAreLoggedOut")}
          </p>
          <div className="flex justify-center">
            <Image
              src={`${assetPrefix}/images/autoLogout.svg`}
              width="95px"
              height="95px"
              alt="auto-logout-ill"
            />
          </div>
          <p
            className="text-base font-normal text-neutral800 font-poppins text-center mt-2.5 mx-auto"
            style={{ maxWidth: "330px" }}
          >
            {t("relogin1")}
            <br /> {t("relogin2")}
          </p>
          <button
            onClick={onClose}
            className="text-primary font-poppins mt-4 hover:opacity-50 mx-auto rounded-sm font-semibold p-4 text-sm"
          >
            {t("close")}
          </button>
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
    getUserName({ token: existingToken })
      .then((_) => {
        // token valid and redirect to authenticated page
        setStorageWithExpiresIn(
          "token_v2",
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
