import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import i18n from "i18";
import InfoIcon from "../../public/icons/InfoIcon";
import html2canvas from "html2canvas";
import XIcon from "@/public/icons/XIcon";
import { assetPrefix } from "next.config";
import { Trans } from "react-i18next";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

import { fontsType } from "@/constants/index";

import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import {
  TFontType,
  TMultiFactorAuthenticationType,
  TSetDefaultSignatureRequestData,
  TSignatureType,
} from "infrastructure/rest/b2b/types";
import {
  restSetDefaultSignature,
  restSetDefaultMFA,
  getUserName,
} from "infrastructure/rest/b2b";
import {
  RestKycCheckStepv2,
  RestPersonalFaceRecognitionV2,
} from "infrastructure/rest/personal";

import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { handleRoute } from "@/utils/handleRoute";
import handleUnauthenticated from "@/utils/handleUnauthenticated";
import fRFailureCounter from "@/utils/fRFailureCounter";

import SignaturePad from "@/components/SignaturePad";
import Button from "@/components/atoms/Button";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import RadioButton from "@/components/atoms/RadioButton";
import FaceRecognitionModal from "@/components/modal/FaceRecognitionModal";
import ConfirmationModal from "@/components/modal/ConfirmationModal";

type Props = {};

type Tform = {} & TSignatureType & TFontType & TMultiFactorAuthenticationType;

type Payload = {
  signature: TSetDefaultSignatureRequestData;
} & TMultiFactorAuthenticationType;

const INITIAL_FORM_STATE: Tform = {
  signature_type: 1,
  font_type: "",
  mfa_type: "fr",
};

function SettingSignatureAndMFA({}: Props) {
  const [form, formSetter] = useState<Tform>(INITIAL_FORM_STATE);
  const [imageURL, setImageURL] = useState<string>();
  const [data, setData] = useState<string>();
  const [agreeOtpPonsel, agreeOtpPonselSetter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowFrModal, setIsShowFrModal] = useState<boolean>(false);
  const [defaultMfa, setDefaultMfa] = useState<
    TMultiFactorAuthenticationType["mfa_type"] | null
  >(null);
  const [showModalOtpPonsel, showModalOtpPonselSetter] =
    useState<boolean>(false);
  const [isShowOtpModalConfirmation, setIsShowOtpModalConfirmation] =
    useState<boolean>(false);

  let ref: any = null;

  const sigPad = useRef<any>();
  const router = useRouter();

  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
    ref = e.currentTarget;

    if (ref.name !== "mfa_type" && ref.name !== "signature_type") {
      convertToDataURL();
    }
  };

  const handleGetUserDataSuccess = (data: string) => {
    const userData = JSON.parse(data);
    const { name, typeMfa } = userData;

    if (typeMfa) {
      formSetter({ ...form, ["mfa_type"]: typeMfa.toLowerCase() });
      setDefaultMfa(typeMfa.toLowerCase());
    }
    setData(name);
  };

  const handleSubmitStarted = () => {
    toast(`Loading...`, {
      type: "info",
      toastId: "info",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color,
      },
    });
    setIsLoading(true);
  };

  const handleFieldEmpty = (signature_type: number) => {
    toast.dismiss("info");
    setIsLoading(false);
    toast(
      `${signature_type === 0 ? t("handwritingRequired") : t("FontRequired")}`,
      {
        type: "error",
        toastId: "error",
        position: "top-center",
        icon: XIcon,
      }
    );
  };

  const handleChangeSignatureAndMfaSuccess = (
    message: string,
    isMustRedirect: boolean
  ) => {
    toast.dismiss("info");
    setIsLoading(false);
    toast(
      isMustRedirect ? "Penggatian tanda tangan dan MFA berhasil" : message,
      {
        type: "success",
        toastId: "success",
      }
    );

    let redirectPath: string;

    if (isMustRedirect) {
      if (router.query.setting === "1" && router.query.signing !== "1") {
        redirectPath = "link-account/success";
      } else if (router.query.v2 === "1") {
        redirectPath = "signing/v2";
      } else {
        redirectPath = "signing";
      }
      setTimeout(() => {
        toast.dismiss("success");
        redirectTo(redirectPath);
      }, 3000);
    } else if (form.mfa_type === "fr") {
      setIsShowOtpModalConfirmation(false);
    } else {
      setIsShowFrModal(false);
    }
  };

  const handleChangeSignatureAndMfaFailure = (message: string) => {
    toast.dismiss("info");
    setIsLoading(false);
    toast(message, {
      type: "error",
      toastId: "error",
      position: "top-center",
      icon: XIcon,
    });
  };

  const handleSetMFAType = (
    mfa_type: Tform["mfa_type"],
    isMustRedirect: boolean
  ) => {
    // will show prompt when change MFA from OTP to FR
    // change MFA from OTP to FR will not show promt, because the prompt was handled by FRCamera components
    if (mfa_type === "fr" && !isMustRedirect) {
      handleSubmitStarted();
    } else {
      setIsLoading(true);
    }

    restSetDefaultMFA({
      payload: {
        mfa_type,
      },
    })
      .then((res) => {
        handleChangeSignatureAndMfaSuccess(res.message, isMustRedirect);
        getUserData();
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleUnauthenticated({ redirectTo });
        } else {
          handleChangeSignatureAndMfaFailure("Terjadi kesalahan");
        }
      });
  };

  const handleSetSignature = async (signature: Payload["signature"]) => {
    const res = await restSetDefaultSignature({
      payload: signature,
    })
      .then((res) => res)
      .catch((err) => {
        if (err.response.status === 401) {
          setIsLoading(false);
          handleUnauthenticated({ redirectTo });
        } else {
          handleChangeSignatureAndMfaFailure("Terjadi kesalahan");
        }
      });
    return res;
  };

  const handleAddSignatureAndMFA = async (payload: Payload) => {
    const { signature, mfa_type } = payload;

    const res = await handleSetSignature(signature);
    if (res?.success) {
      if (!defaultMfa) {
        handleChangeSignatureAndMfaSuccess(
          "Penggatian tanda tangan dan MFA berhasil",
          false
        );
      } else {
        handleSetMFAType(mfa_type, true);
      }
    } else {
      handleChangeSignatureAndMfaFailure(res?.message!);
    }
  };

  const redirectTo = (pathname = "login") => {
    router.replace({
      pathname: handleRoute(pathname),
      query: { ...router.query, next_path: "setting-signature-and-mfa" },
    });
  };

  const getUserData = () => {
    getUserName({})
      .then((res) => {
        handleGetUserDataSuccess(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleUnauthenticated({ redirectTo });
        }
      });
  };

  const convertToDataURL = async () => {
    const canvas = await html2canvas(ref.parentNode.children[1], {
      height: 60,
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
    canvas.style.backgroundColor = "rgba(0, 0, 0, 0)";
    const image = canvas.toDataURL("image/png");
    setImageURL(image);
  };

  const handleFormOnSubmit = (
    e: React.SyntheticEvent,
    type: "change_mfa" | "submit"
  ): void => {
    e.preventDefault();

    const signature_image = sigPad.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    const { signature_type, font_type, mfa_type } = form;

    const signature = {
      signature_type,
      font_type: signature_type == 0 ? "" : font_type,
      signature_image:
        signature_type == 1 ? (imageURL as string) : signature_image,
    };

    if (
      (signature_type == 0 && sigPad.current.isEmpty() && type === "submit") ||
      (signature_type == 1 && !imageURL && type === "submit")
    ) {
      handleFieldEmpty(Number(signature_type));
    } else if (type === "change_mfa") {
      if (mfa_type === "fr") {
        setIsShowOtpModalConfirmation(true);
      } else {
        setIsShowFrModal(true);
      }
    } else {
      handleSubmitStarted();
      handleAddSignatureAndMFA({ signature, mfa_type });
    }
  };

  const captureProcessor = (base64Img: string | null | undefined) => {
    const payload = {
      face_image: base64Img?.split(",")[1] as string,
    };

    setIsLoading(true);

    const mfa_type = "otp";

    RestPersonalFaceRecognitionV2({ payload })
      .then((res) => {
        if (res.success) {
          handleSetMFAType(mfa_type, false);
        } else {
          setIsLoading(false);
          toast.dismiss("info");
          fRFailureCounter({
            setModal: setIsShowFrModal,
            redirectTo,
            errorMessage: res.message,
          });
        }
      })
      .catch((err) => {
        setIsShowFrModal(false);
        toast.dismiss("info");
        if (err.response?.status === 401) {
          handleUnauthenticated({ redirectTo });
        } else {
          toast.error(err.response?.data?.message || "Gagal validasi wajah", {
            icon: <XIcon />,
          });
        }
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push({
        pathname: handleRoute("login"),
        query: { ...router.query },
      });
    } else {
      getUserData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background,
          "BG"
        ),
      }}
    >
      <Head>
        <title>{t("settingSignatureTitleAndMFA")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="p-4 max-w-md mx-auto">
        <Heading className="mt-2">{t("settingSignatureTitleAndMFA")}</Heading>
        <form>
          <div
            className="bg-contain w-64 mx-auto my-5 h-64 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data
                  .asset_activation_setting_signature_and_mfa,
                "ASSET",
                `${assetPrefix}/images/ttdSetting.svg`
              )})`,
            }}
          ></div>
          <Paragraph>{t("chooseSignature")}</Paragraph>
          <div className="mt-2 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs poppins-regular text-blue500 ml-4">
              {t("chooseSignatureInformation")}
            </p>
          </div>
          <div className="mt-5">
            <RadioButton
              onChangeHandler={handleFormOnChange}
              isChecked={form.signature_type == 0}
              value={0}
              title={t("signatureOption1")}
              type="bullet"
              name="signature_type"
            />
            <RadioButton
              onChangeHandler={handleFormOnChange}
              isChecked={form.signature_type == 1}
              value={1}
              title={t("signatureOption2")}
              type="bullet"
              name="signature_type"
            />
          </div>
          <div className={form.signature_type == 0 ? "block" : "hidden"}>
            <SignaturePad sigPad={sigPad} />
          </div>
          <div className={form.signature_type == 1 ? "block" : "hidden"}>
            <div
              className={`grid  ${
                (data?.length as number) > 15 ? "grid-cols gap-5" : "grid-col-2"
              } gap-3 mt-5`}
            >
              {fontsType.map((font: string) => (
                <RadioButton
                  type="button"
                  name="font_type"
                  key={font}
                  onChangeHandler={handleFormOnChange}
                  title={data!}
                  isChecked={form.font_type === font}
                  fontFamily={font}
                  value={font}
                />
              ))}
            </div>
          </div>
          <Paragraph className="mt-8">
            {t("choosetAutheticantionMode")}
          </Paragraph>
          <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs poppins-regular text-blue500 ml-4 whitespace-break-spaces">
              {defaultMfa ? (
                t("choosetAutheticantionModeInformation.haveDefaultMfa")
              ) : (
                <Trans
                  values={{
                    mfa: "Multi Factor Authentication",
                  }}
                  i18nKey="choosetAutheticantionModeInformation.dontHaveDefaultMfa"
                  components={[<i key={0} />]}
                />
              )}
            </p>
          </div>
          <div className="mt-6">
            <RadioButton
              name="mfa_type"
              onChangeHandler={handleFormOnChange}
              isChecked={form.mfa_type === "fr"}
              title="Face Recognition"
              type="bullet"
              value="fr"
            />
            <RadioButton
              name="mfa_type"
              onChangeHandler={handleFormOnChange}
              isChecked={form.mfa_type === "otp"}
              title="OTP via Email"
              type="bullet"
              value="otp"
            />
            <label className="flex items-center mt-3.5">
              <input
                disabled
                name="mfa_type"
                value="mfa_type_otp_ponsel"
                onChange={agreeOtpPonsel ? handleFormOnChange : undefined}
                onClick={
                  agreeOtpPonsel
                    ? undefined
                    : (_: React.MouseEvent<HTMLInputElement>) => {
                        showModalOtpPonselSetter(true);
                      }
                }
                checked={form.mfa_type === "otp_ponsel"}
                type="radio"
                className="appearance-none disabled:opacity-50 bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 poppins-regular opacity-50 text-_030326">
                {t("autheticantionMode3")}
              </p>
            </label>
          </div>
          {defaultMfa !== null ? (
            <>
              <Button
                onClick={(e) => handleFormOnSubmit(e, "change_mfa")}
                disabled={defaultMfa === form.mfa_type}
                size="none"
                className="py-2 mx-auto whitespace-nowrap mt-5"
                style={{
                  backgroundColor: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.button_color
                  ),
                }}
              >
                {t("setMFA.submitBtn")}
              </Button>
              <Button
                size="none"
                variant="ghost"
                className="mt-5 px-6 py-2.5 text-base block mx-auto disabled:opacity-50"
                onClick={(e) => handleFormOnSubmit(e, "submit")}
                disabled={isLoading || defaultMfa !== form.mfa_type}
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.button_color
                  ),
                }}
              >
                {t("next")}
              </Button>
            </>
          ) : (
            <Button
              onClick={(e) => handleFormOnSubmit(e, "submit")}
              size="none"
              className="mt-8 px-6 py-2.5 text-base bg-primary block mx-auto"
              disabled={isLoading}
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.button_color
                ),
              }}
            >
              {t("next")}
            </Button>
          )}
          <Footer />
        </form>
        <div
          className={[
            `${showModalOtpPonsel ? "flex" : "hidden"}`,
            "fixed left-0 top-0 justify-center items-center inset-0 z-50",
          ].join(" ")}
        >
          <div className="absolute bg-black opacity-80 inset-0 z-0"></div>
          <div className="w-full max-w-352px px-3 py-5 relative mx-auto my-auto rounded-xl shadow-lg bg-white ">
            <div className="">
              <div className="text-center poppins-regular flex-auto justify-center">
                <p className="text-base text-neutral800">
                  Untuk mengirimkan OTP via Ponsel, maka Anda perlu membagikan
                  informasi Nomor Ponsel yang terdaftar di Dana Bagus kepada
                  Tilaka. Apakah Anda setuju?
                </p>
              </div>
              <div className="mt-10">
                <button
                  onClick={(_: React.MouseEvent<HTMLButtonElement>) => {
                    agreeOtpPonselSetter(true);
                    showModalOtpPonselSetter(false);
                    formSetter({ ...form, mfa_type: "otp_ponsel" });
                  }}
                  className="text-white bg-primary p-2.5 w-full rounded-sm"
                >
                  SETUJU
                </button>
                <button
                  onClick={(_: React.MouseEvent<HTMLButtonElement>) => {
                    agreeOtpPonselSetter(false);
                    showModalOtpPonselSetter(false);
                  }}
                  className="text-neutral80 bg-white p-2.5 w-full rounded-sm mt-2"
                >
                  BATAL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* modal */}
      <FaceRecognitionModal
        isShowModal={isShowFrModal}
        isDisabled={isLoading}
        setIsShowModal={setIsShowFrModal}
        callbackCaptureProcessor={captureProcessor}
        signingFailedRedirectTo={handleRoute("login")}
        title={t("setMFA.modal.title")}
      />
      <ConfirmationModal
        isShow={isShowOtpModalConfirmation}
        isDisabled={isLoading}
        onCancelHandler={() => {
          setIsLoading(false);
          setIsShowOtpModalConfirmation(false);
        }}
        onConfirmHandler={() => handleSetMFAType("fr", false)}
      >
        <div className="px-5 py-5 flex justify-start gap-5 items-start">
          <div>
            <p className="poppins-regular block text-center font-semibold ">
              {t("setMFA.modal.title")}
            </p>
            <p className="mt-8 text-sm text-center">
              {t("setMFA.modal.FRSubtitle")}
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const isNotRedirect: boolean = true;
  const uuid =
    cQuery.transaction_id ?? cQuery.request_id ?? cQuery.registration_id;

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

  return serverSideRenderReturnConditions({
    context,
    checkStepResult,
    isNotRedirect,
  });
};

export default SettingSignatureAndMFA;
