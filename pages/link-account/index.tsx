import { useEffect, useState } from "react";
import Image from "next/legacy/image";
import EyeIcon from "./../../public/icons/EyeIcon";
import EyeIconOff from "./../../public/icons/EyeIconOff";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/loginSlice";
import Head from "next/head";
import { TLoginProps } from "@/interface/interface";
import { assetPrefix } from "../../next.config";
import { handleRoute } from "./../../utils/handleRoute";
import {
  getCertificateList,
  getUserName,
  restLogout,
} from "infrastructure/rest/b2b";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import FRCamera from "@/components/FRCamera";
import i18n from "i18";
import { toast } from "react-toastify";
import {
  RestKycCheckStepv2,
  RestPersonalFaceRecognition,
  RestPersonalApproveConsent,
} from "infrastructure/rest/personal/index";
import XIcon from "@/public/icons/XIcon";

import {
  setFRFailedCount,
  getFRFailedCount,
  resetFRFailedCount,
} from "@/utils/frFailedCountGetterSetter";
import { setStorageWithExpiresIn } from "@/utils/localStorageWithExpiresIn";
import { getExpFromToken } from "@/utils/getExpFromToken";
import Link from "next/link";
import { getEncodedCurrentUrl } from "@/utils/getEncodedCurrentUrl";
import Footer from "@/components/Footer";
import Button, { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import ModalLayout from "@/components/layout/ModalLayout";
import CloseIcon from "@/public/icons/CloseIcon";
import TextInput from "@/components/atoms/TextInput";

type Props = {
  checkStepResultDataRoute: TKycCheckStepResponseData["data"]["route"];
  tilakaName: TKycCheckStepResponseData["data"]["user_identifier"]
};

type Tform = {
  tilaka_name: string;
  password: string;
};

type IModal = {
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  formSetter: React.Dispatch<React.SetStateAction<Tform>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  tilakaName: string;
};

type IModalConsent = {
  modalConsent: {
    show: boolean;
    data: { queryWithDynamicRedirectURL: any } | null;
  };
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setModalConsent: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      data: { queryWithDynamicRedirectURL: any } | null;
    }>
  >;
  formSetter: React.Dispatch<React.SetStateAction<Tform>>;
  tilakaName: string;
};

type TLinkingModal = {
  fillTilakaName: () => void;
  isShowLinkingModal: boolean;
  setIsShowLinkingModal: React.Dispatch<React.SetStateAction<boolean>>;
  tilakaName: string;
};

const LinkAccount = (props: Props) => {
  const router = useRouter();
  const { t }: any = i18n;
  const [showPassword, showPasswordSetter] = useState<boolean>(false);
  const [nikRegistered, nikRegisteredSetter] = useState<boolean>(true);
  const [form, formSetter] = useState<Tform>({ tilaka_name: "", password: "" });
  const [modal, setModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTilakaNameFieldDisabled, setIsTilakaNameFieldDisabled] =
    useState<boolean>(false);
  const [isShowLinkingModal, setIsShowLinkingModal] = useState<boolean>(false);
  const [modalConsent, setModalConsent] = useState<{
    show: boolean;
    data: { queryWithDynamicRedirectURL: any } | null;
  }>({ show: false, data: null });
  const {
    nik,
    request_id,
    signing,
    setting,
    is_penautan,
    ...restRouterQuery
  } = router.query;
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.login);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
  };

  const fillTilakaName = () => {
    setIsTilakaNameFieldDisabled(true);
    setIsShowLinkingModal(false);
    formSetter({ ...form, tilaka_name: props.tilakaName });
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    setIsLoading(true);
    toast(`Loading...`, {
      type: "info",
      toastId: "load",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });

    const target = e.target as typeof e.target & {
      tilaka_name: { value: Tform["tilaka_name"] };
      password: { value: Tform["password"] };
    };

    const tilaka_name = target.tilaka_name.value;
    const password = target.password.value;

    dispatch(
      login({
        password,
        nik,
        tilaka_name,
        request_id,
        ...restRouterQuery,
      } as TLoginProps)
    );
  };

  console.log(props);

  useEffect(() => {
    if (props.tilakaName) {
      setIsShowLinkingModal(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    // res -- data.data.is_penautan: boolean;
    if (data.status === "FULLFILLED" && data.data.success) {
      let queryWithDynamicRedirectURL = {
        ...router.query,
      };
      if (data.data.message.length > 0 && setting === "1") {
        queryWithDynamicRedirectURL["redirect_url"] = data.data.message;
      }
      localStorage.setItem("refresh_token", data.data.data[1] as string);
      setStorageWithExpiresIn(
        "token",
        data.data.data[0] as string,
        getExpFromToken(data.data.data[0]) as number
      );

      // penautan and penautan_consent will redirected to /linking/* result page
      if (signing === "1" || setting === "1") {
        toast.dismiss("load");
        getCertificateList({ params: "" as string }).then((res) => {
          const certif = JSON.parse(res.data);
          if (certif[0].status == "Aktif") {
            getUserName({}).then((res) => {
              const data = JSON.parse(res.data);
              if (data.typeMfa == null) {
                if (setting === "1") {
                  router.replace({
                    pathname: handleRoute("setting-signature-and-mfa"),
                    query: {
                      ...queryWithDynamicRedirectURL,
                      tilaka_name: form.tilaka_name,
                    },
                  });
                } else {
                  router.replace({
                    pathname: handleRoute("link-account/success"),
                    query: { ...queryWithDynamicRedirectURL },
                  });
                }
              } else {
                router.replace({
                  pathname: handleRoute("link-account/success"),
                  query: { ...queryWithDynamicRedirectURL },
                });
              }
            });
          } else if (certif[0].status == "Enroll") {
            setIsLoading(false);
            toast.dismiss();
            toast.warning(
              "Penerbitan sertifikat dalam proses, cek email Anda untuk informasi sertifikat"
            );
          } else {
            router.replace({
              pathname: handleRoute("certificate-information"),
              query: {
                ...queryWithDynamicRedirectURL,
                tilaka_name: form.tilaka_name,
              },
            });
          }
        });
      } else {
        toast.dismiss("load");
        if (data.data.data[2] === "penautan") {
          setModal(true);
        } else if (data.data.data[2] === "penautan_consent") {
          setModalConsent({
            show: true,
            data: { queryWithDynamicRedirectURL },
          });
        } else {
          router.replace({
            pathname: handleRoute("link-account/success"),
            query: { ...queryWithDynamicRedirectURL },
          });
        }
      }
    } else if (data.status === "FULLFILLED" && !data.data.success) {
      setIsLoading(false);
      if (
        data.data.message ===
          `Invalid Username / Password for Tilaka Name ${form?.tilaka_name}` ||
        data.data.message === "User Not Found" ||
        data.data.message === "NIK Not Equals ON Tilaka System" ||
        data.data.message === "Error, tilaka Name not valid"
      ) {
        setIsLoading(false);
        toast.dismiss();
        toast.error(t("invalidUsernamePassword"));
      } else if (data.data.message === "Sudah melakukan penautan") {
        dispatch(
          login({
            password: form.password,
            tilaka_name: form.tilaka_name,
            ...restRouterQuery,
          } as TLoginProps)
        );
      } else if (
        data.data.message ===
        "Saat ini akun Anda terkunci. Silahkan coba login beberapa saat lagi."
      ) {
        setIsLoading(true);
        toast.dismiss();
        toast.error(
          "Saat ini akun Anda terkunci. Silahkan coba login beberapa menit lagi."
        );
        setTimeout(() => {
          router.replace({
            pathname: handleRoute("link-account/failure"),
            query: {
              ...router.query,
              account_locked: "1",
            },
          });
        }, 2500);
      } else if (
        data.data.message ===
        "Penerbitan sertifikat dalam proses, cek email Anda untuk informasi sertifikat"
      ) {
        setIsLoading(false);
        toast.dismiss();
        toast.warning(data.data.message);
      }
    } else if (
      data.status === "REJECTED" ||
      (data.status === "FULLFILLED" && !data.data.success)
    ) {
      toast.dismiss();
      router.replace({
        pathname: handleRoute("link-account/failure"),
        query: {
          ...router.query,
        },
      });
      setIsLoading(false);
    }
  }, [data.status]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <title>
          {setting === "1" ? t("finalFormTitle") : t("linkAccountTitle")}
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 py-9 max-w-md mx-auto">
        <Heading className="text-lg poppins-semibold text-neutral800">
          {setting === "1" ? t("finalFormTitle") : t("linkAccountTitle")}
        </Heading>
        <div
          className="bg-contain my-3 w-52 mx-auto h-64 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_activation_login as string,
              "ASSET",
              `${assetPrefix}/images/linkAccount.svg`
            )})`,
          }}
        ></div>
        {nikRegistered && (
          <Paragraph className="poppins-regular text-sm text-neutral800 mt-5">
            {setting === "1"
              ? t("linkAccountSubtitle1")
              : t("linkAccountSubtitle")}
          </Paragraph>
        )}
        <form onSubmit={handleFormOnSubmit}>
          <label className="block mt-4">
            <div className="flex justify-start items-center">
              <Paragraph size="sm" className="pl-2.5">
                Tilaka Name
              </Paragraph>
              <div className="tooltip poppins-regular">
                <p className="text-white bg-neutral200 w-3 h-3 flex justify-center items-center text-xs rounded-full ml-1">
                  ?
                </p>
                <span className="tooltiptext text-xs">
                  {t("linkAccountTooltip")}
                </span>
              </div>
            </div>
            <div className="mt-1 relative">
              <TextInput
                type="text"
                name="tilaka_name"
                placeholder={t("linkAccountPlaceholder")}
                value={form.tilaka_name}
                onChangeHandler={handleFormOnChange}
                customStyle="text-sm"
                isDisabled={isTilakaNameFieldDisabled}
              />
            </div>
          </label>
          <label className="block mt-6">
            <div className="flex justify-start items-center">
              <Paragraph size="sm" className="pl-2.5">
                {t("linkAccountPasswordInputlabel")}
              </Paragraph>
            </div>
            <div className="mt-1 relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("passwordPlaceholder")}
                value={form.password}
                onChangeHandler={handleFormOnChange}
                customStyle="text-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  showPasswordSetter(!showPassword);
                }}
                className="absolute right-2.5 top-3 bg-white"
              >
                {showPassword ? <EyeIconOff /> : <EyeIcon />}
              </button>
            </div>
          </label>
          <div className="flex justify-center items-center mt-10">
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
                className={buttonVariants({
                  variant: "ghost",
                  size: "none",
                  className: "text-xs",
                })}
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
                className={buttonVariants({
                  variant: "ghost",
                  size: "none",
                  className: "text-xs",
                })}
              >
                {t("linkAccountForgotTilakaName")}
              </a>
            </Link>
          </div>
          <Button
            type="submit"
            disabled={!form.tilaka_name || !form.password || isLoading}
            size="none"
            className="mt-8 p-2.5 uppercase text-base font-medium block mx-auto"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
          >
            {setting === "1" ? t("linkAccountCTA1") : t("linkAccountCTA")}
          </Button>
        </form>
        <Footer />
      </div>
      <FRModal
        formSetter={formSetter}
        tilakaName={form.tilaka_name}
        modal={modal}
        setModal={setModal}
        setIsLoading={setIsLoading}
      />
      <ModalConsent
        formSetter={formSetter}
        tilakaName={form.tilaka_name}
        modalConsent={modalConsent}
        setModalConsent={setModalConsent}
        setIsLoading={setIsLoading}
      />
      <ModalLinking
        fillTilakaName={fillTilakaName}
        isShowLinkingModal={isShowLinkingModal}
        setIsShowLinkingModal={setIsShowLinkingModal}
        tilakaName={props.tilakaName}
      />
    </div>
  );
};

const FRModal = ({
  modal,
  setModal,
  tilakaName,
  formSetter,
  setIsLoading,
}: IModal) => {
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);
  const controller = new AbortController();

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;
  const router = useRouter();

  const captureProcessor = (base64Img: string | null | undefined) => {
    const payload = {
      registerId: router.query.request_id as string,
      tilakaName: tilakaName,
      faceImage: base64Img?.split(",")[1] as string,
    };

    const doRedirect = (path: string) => {
      router.push({
        pathname: handleRoute(path),
        query: {
          ...router.query,
          next_path: "manual_form",
        },
      });
    };

    RestPersonalFaceRecognition({ payload })
      .then((res) => {
        if (res.success) {
          toast.dismiss("info");
          toast(res.message, {
            type: "success",
            position: "top-center",
          });
          setIsFRSuccess(true);
          resetFRFailedCount("count");
          doRedirect("link-account/linking/success");
        } else {
          setIsFRSuccess(false);
          setModal(false);
          if (res.message === "Gagal Validasi Wajah") {
            setTimeout(() => {
              setModal(true);
            }, 100);
          }
          toast.dismiss("info");
          toast.error(res.message, { icon: <XIcon /> });
          setFRFailedCount("count", res.data.failMfa);
          if (res.data.failMfa >= 5) {
            doRedirect("link-account/linking/failure");
          }
        }
      })
      .catch((err) => {
        setModal(false);
        toast.dismiss("info");
        if (err.response?.status === 401) {
          toast.error(err.response?.data?.message, { icon: <XIcon /> });
        } else {
          toast.error(err.response?.data?.message || "Gagal validasi wajah", {
            icon: <XIcon />,
          });
          const doCounting: number = getFRFailedCount("count") + 1;
          setFRFailedCount("count", doCounting);
          const newCount: number = getFRFailedCount("count");
          if (newCount >= 5) {
            doRedirect("link-account/linking/failure");
          }
        }
      });
  };

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        <>
          <Heading size="sm" className="block text-center">
            {t("linkingAccount")}
          </Heading>
          <Paragraph size="sm" className="mt-2 block text-center">
            {t("frSubtitle3")}
          </Paragraph>
          <FRCamera
            setModal={setModal}
            setIsFRSuccess={setIsFRSuccess}
            signingFailedRedirectTo={handleRoute("login/v2")}
            tokenIdentifier="token_v2"
            callbackCaptureProcessor={captureProcessor}
          />
          <Button
            onClick={() => {
              controller.abort();
              setIsLoading(false);
              toast.dismiss("info");
              restLogout({});
              setModal(!modal);
              formSetter({
                tilaka_name: "",
                password: "",
              });
            }}
            size="none"
            className="mt-5 mb-2 uppercase text-base font-bold h-9"
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

const ModalConsent = ({
  modalConsent,
  setModalConsent,
  tilakaName,
  formSetter,
  setIsLoading,
}: IModalConsent) => {
  const controller = new AbortController();
  const router = useRouter();
  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const onApprove = () => {
    RestPersonalApproveConsent({
      registerId: modalConsent.data?.queryWithDynamicRedirectURL
        .request_id as string,
      tilakaName,
    })
      .then((res) => {
        if (res.success) {
          let queryWithDynamicRedirectURL = {
            ...modalConsent.data?.queryWithDynamicRedirectURL,
            tilaka_name: tilakaName,
          };
          const params = {
            "request-id": queryWithDynamicRedirectURL.request_id,
            "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
          };
          let queryString = new URLSearchParams(params as any).toString();

          if (queryWithDynamicRedirectURL.redirect_url?.length) {
            const currentRedirectUrl =
              queryWithDynamicRedirectURL.redirect_url as string;
            const currentRedirectUrlArr = currentRedirectUrl.split("?");

            if (currentRedirectUrlArr.length > 1) {
              if (
                currentRedirectUrlArr[1].includes("request-id") &&
                currentRedirectUrlArr[1].includes("tilaka-name")
              ) {
                // do nothing, return redirect_url from response checkPassword with not addition params
                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&";
              } else if (currentRedirectUrlArr[1].includes("request-id")) {
                const additionParams = {
                  ...params,
                  "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
                };
                queryString = new URLSearchParams(
                  additionParams as any
                ).toString();

                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              } else if (currentRedirectUrlArr[1].includes("tilaka-name")) {
                const additionParams = {
                  ...params,
                  "request-id": queryWithDynamicRedirectURL.request_id,
                };
                queryString = new URLSearchParams(
                  additionParams as any
                ).toString();

                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              } else {
                // manualy input redirect_url on url
                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              }
            } else {
              // current redirect_url no has param
              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] + "?" + queryString;
            }
          }

          router.replace({
            pathname: handleRoute("link-account/linking/success"),
            query: { ...queryWithDynamicRedirectURL },
          });
        } else {
          let queryWithDynamicRedirectURL = {
            ...modalConsent.data?.queryWithDynamicRedirectURL,
            tilaka_name: tilakaName,
          };
          const params = {
            status: "F",
            reason: "user already exist",
          };
          let queryString = new URLSearchParams(params as any).toString();

          if (queryWithDynamicRedirectURL.redirect_url?.length) {
            const currentRedirectUrl =
              queryWithDynamicRedirectURL.redirect_url as string;
            const currentRedirectUrlArr = currentRedirectUrl.split("?");

            if (currentRedirectUrlArr.length > 1) {
              if (
                currentRedirectUrlArr[1].includes("request-id") &&
                currentRedirectUrlArr[1].includes("tilaka-name")
              ) {
                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              } else if (currentRedirectUrlArr[1].includes("request-id")) {
                const additionParams = {
                  ...params,
                  "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
                };
                queryString = new URLSearchParams(
                  additionParams as any
                ).toString();

                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              } else if (currentRedirectUrlArr[1].includes("tilaka-name")) {
                const additionParams = {
                  ...params,
                  "request-id": queryWithDynamicRedirectURL.request_id,
                };
                queryString = new URLSearchParams(
                  additionParams as any
                ).toString();

                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              } else {
                // manualy input redirect_url on url
                queryWithDynamicRedirectURL.redirect_url =
                  currentRedirectUrlArr[0] +
                  "?" +
                  currentRedirectUrlArr[1] +
                  "&" +
                  queryString;
              }
            } else {
              // current redirect_url no has param
              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] + "?" + queryString;
            }

            router.replace({
              pathname: handleRoute("link-account/linking/failure"),
              query: {
                ...queryWithDynamicRedirectURL,
              },
            });
          } else {
            // redirect_url not exist
            router.replace({
              pathname: handleRoute("link-account/linking/failure"),
              query: {
                ...queryWithDynamicRedirectURL,
                ...params,
              },
            });
          }
        }
      })
      .catch((err) => {
        let queryWithDynamicRedirectURL = {
          ...modalConsent.data?.queryWithDynamicRedirectURL,
          tilaka_name: tilakaName,
        };
        const params = {
          status: "F",
          reason: "something wrong",
        };
        let queryString = new URLSearchParams(params as any).toString();

        if (queryWithDynamicRedirectURL.redirect_url?.length) {
          const currentRedirectUrl =
            queryWithDynamicRedirectURL.redirect_url as string;
          const currentRedirectUrlArr = currentRedirectUrl.split("?");

          if (currentRedirectUrlArr.length > 1) {
            if (
              currentRedirectUrlArr[1].includes("request-id") &&
              currentRedirectUrlArr[1].includes("tilaka-name")
            ) {
              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] +
                "?" +
                currentRedirectUrlArr[1] +
                "&" +
                queryString;
            } else if (currentRedirectUrlArr[1].includes("request-id")) {
              const additionParams = {
                ...params,
                "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
              };
              queryString = new URLSearchParams(
                additionParams as any
              ).toString();

              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] +
                "?" +
                currentRedirectUrlArr[1] +
                "&" +
                queryString;
            } else if (currentRedirectUrlArr[1].includes("tilaka-name")) {
              const additionParams = {
                ...params,
                "request-id": queryWithDynamicRedirectURL.request_id,
              };
              queryString = new URLSearchParams(
                additionParams as any
              ).toString();

              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] +
                "?" +
                currentRedirectUrlArr[1] +
                "&" +
                queryString;
            } else {
              // manualy input redirect_url on url
              queryWithDynamicRedirectURL.redirect_url =
                currentRedirectUrlArr[0] +
                "?" +
                currentRedirectUrlArr[1] +
                "&" +
                queryString;
            }
          } else {
            // current redirect_url no has param
            queryWithDynamicRedirectURL.redirect_url =
              currentRedirectUrlArr[0] + "?" + queryString;
          }

          router.replace({
            pathname: handleRoute("link-account/linking/failure"),
            query: {
              ...queryWithDynamicRedirectURL,
            },
          });
        } else {
          // redirect_url not exist
          router.replace({
            pathname: handleRoute("link-account/linking/failure"),
            query: {
              ...queryWithDynamicRedirectURL,
              ...params,
            },
          });
        }
      });
    // catch to penautan failure with
  };

  const onReject = () => {
    // call api
    // redirect with status=F&reason=reject by user pada redirect url
    // not call api, logout enough
    setIsLoading(false);
    controller.abort();
    toast.dismiss("info");
    restLogout({});
    setModalConsent({ show: !modalConsent.show, data: null });
    formSetter({
      tilaka_name: "",
      password: "",
    });

    let queryWithDynamicRedirectURL = {
      ...modalConsent.data?.queryWithDynamicRedirectURL,
      tilaka_name: tilakaName,
    };
    const params = {
      status: "F",
      reason: "reject by user",
    };
    let queryString = new URLSearchParams(params as any).toString();

    if (queryWithDynamicRedirectURL.redirect_url?.length) {
      const currentRedirectUrl =
        queryWithDynamicRedirectURL.redirect_url as string;
      const currentRedirectUrlArr = currentRedirectUrl.split("?");

      if (currentRedirectUrlArr.length > 1) {
        if (
          currentRedirectUrlArr[1].includes("request-id") &&
          currentRedirectUrlArr[1].includes("tilaka-name")
        ) {
          queryWithDynamicRedirectURL.redirect_url =
            currentRedirectUrlArr[0] +
            "?" +
            currentRedirectUrlArr[1] +
            "&" +
            queryString;
        } else if (currentRedirectUrlArr[1].includes("request-id")) {
          const additionParams = {
            ...params,
            "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
          };
          queryString = new URLSearchParams(additionParams as any).toString();

          queryWithDynamicRedirectURL.redirect_url =
            currentRedirectUrlArr[0] +
            "?" +
            currentRedirectUrlArr[1] +
            "&" +
            queryString;
        } else if (currentRedirectUrlArr[1].includes("tilaka-name")) {
          const additionParams = {
            ...params,
            "request-id": queryWithDynamicRedirectURL.request_id,
          };
          queryString = new URLSearchParams(additionParams as any).toString();

          queryWithDynamicRedirectURL.redirect_url =
            currentRedirectUrlArr[0] +
            "?" +
            currentRedirectUrlArr[1] +
            "&" +
            queryString;
        } else {
          // manualy input redirect_url on url
          queryWithDynamicRedirectURL.redirect_url =
            currentRedirectUrlArr[0] +
            "?" +
            currentRedirectUrlArr[1] +
            "&" +
            queryString;
        }
      } else {
        // current redirect_url no has param
        queryWithDynamicRedirectURL.redirect_url =
          currentRedirectUrlArr[0] + "?" + queryString;
      }

      router.replace({
        pathname: handleRoute("link-account/linking/failure"),
        query: {
          ...queryWithDynamicRedirectURL,
          reject_by_user: "1",
        },
      });
    } else {
      // redirect_url not exist
      router.replace({
        pathname: handleRoute("link-account/linking/failure"),
        query: {
          ...queryWithDynamicRedirectURL,
          ...params,
          reject_by_user: "1",
        },
      });
    }
  };

  return modalConsent.show ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full overflow-y-auto"
    >
      <div className="bg-white max-w-3xl mt-20 mb-10 pt-5 px-2 pb-3 rounded-md w-full mx-5">
        <>
          <div className="rounded px-2 sm:px-6 pt-4 pb-6 bg-white">
            <div className="bg-neutral10 px-4 sm:px-10 md:px-16 pt-4 pb-6">
              <Heading
                size="md"
                className="sm:text-xl md:text-2xl font-normal text-center"
              >
                {t("page")}{" "}
                <Heading size="md" className="italic font-normal inline">
                  {t("customerConsentText")}
                </Heading>
              </Heading>
              <div
                className="bg-contain w-48 mt-3 mx-auto h-48 bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                    themeConfiguration.data
                      .asset_action_popup_consent as string,
                    "ASSET",
                    `${assetPrefix}/images/customerConsent.svg`
                  )})`,
                }}
              ></div>
              <Paragraph size="sm" className="mt-3 text-center">
                {t("linkAccountConsentText")}
              </Paragraph>
            </div>
            <div className="flex justify-end items-center gap-3 mt-5">
              <Button
                onClick={onReject}
                size="none"
                variant="ghost"
                className="text-base font-base h-2 hover:opacity-50"
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.action_font_color as string
                  ),
                }}
              >
                {t("consentDisagree")}
              </Button>
              <a
                onClick={onApprove}
                className={buttonVariants({
                  size: "none",
                  className: "font-base py-2.5 mx-0",
                })}
                style={{
                  backgroundColor: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.button_color as string
                  ),
                  margin: "0",
                }}
              >
                {t("consentAgree")}
              </a>
            </div>
          </div>
        </>
      </div>
    </div>
  ) : null;
};

const ModalLinking = ({
  isShowLinkingModal,
  fillTilakaName,
  setIsShowLinkingModal,
  tilakaName,
}: TLinkingModal) => {
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return isShowLinkingModal ? (
    <ModalLayout>
      <div className="flex justify-end">
        <button
          onClick={() => setIsShowLinkingModal(false)}
          className="hover:opacity-50"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="flex flex-col gap-10 pt-5 pb-10 align-items-center text-center">
        <Heading className="font-normal text-2xl">
          NIK Anda Telah Terdaftar
        </Heading>
        <Paragraph>
          Lanjutkan proses penautan aku dengan memasukkan Tilaka Name dan Kata
          sandi Anda.
        </Paragraph>
        <Paragraph className="font-semibold rounded-md py-2 bg-[#DDEBFE]">
          Tilaka Name : {tilakaName}
        </Paragraph>
        <Button
          size="none"
          className="mt-5 mb-2 uppercase text-base font-bold h-9"
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
          }}
          onClick={fillTilakaName}
        >
          Tautkan Akun
        </Button>
      </div>
    </ModalLayout>
  ) : null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const isNotRedirect = true;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;
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
    checkStepResultDataRoute: checkStepResult.res?.data?.route || null,
    tilakaName: checkStepResult.res?.data?.user_identifier || null
  };

  return serverSideRenderReturnConditionsResult;
};

export default LinkAccount;
