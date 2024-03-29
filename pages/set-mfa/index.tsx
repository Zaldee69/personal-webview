import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import Footer from "@/components/Footer";
import FaceRecognitionModal from "@/components/modal/FaceRecognitionModal";
import InfoIcon from "@/public/icons/InfoIcon";
import XIcon from "@/public/icons/XIcon";
import { AppDispatch, RootState } from "@/redux/app/store";
import { resetInitalState } from "@/redux/slices/loginSlice";
import {
  getFRFailedCount,
  setFRFailedCount,
} from "@/utils/frFailedCountGetterSetter";
import { handleRoute } from "@/utils/handleRoute";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import i18n from "i18";
import { getUserName, restSetDefaultMFA } from "infrastructure/rest/b2b";
import { RestPersonalFaceRecognitionV2 } from "infrastructure/rest/personal";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

type IModalFR = {
  isShowModalFr: boolean;
  setShowModalFr: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  geTypeMfa: () => void;
};

type IOtpModalConfrimation = {
  isShowOtpModalConfirmation: boolean;
  setIsShowOtpModalConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  onClickHandler: (clickEventType: "submit" | "confirmation") => void;
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
};

const SetMfa = () => {
  const { t }: any = i18n;
  const router = useRouter();

  const [isShowModalFr, setShowModalFr] = useState<boolean>(false);
  const [isShowOtpModalConfirmation, setIsShowOtpModalConfirmation] =
    useState<boolean>(false);
  const [mfaMethod, setMfaMethod] = useState<"fr" | "otp" | null>(null);
  const [defaultMfa, setDefaultMfa] = useState<"fr" | "otp">("fr");
  const [isShowPage, setIsShowpage] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setMfaMethod(e.currentTarget.value as "fr" | "otp");
  };

  const onClickHandler = (clickEventType: "submit" | "confirmation") => {
    if (clickEventType === "confirmation") {
      if (mfaMethod === "otp") {
        setShowModalFr(true);
      } else {
        setIsShowOtpModalConfirmation(true);
      }
    } else {
      if (mfaMethod === "fr" && mfaMethod !== defaultMfa) {
        setIsDisabled(true);
        toast(`Loading...`, {
          type: "info",
          toastId: "info",
          isLoading: true,
          position: "top-center",
          style: {
            backgroundColor: themeConfiguration?.data.toast_color as string,
          },
        });
        restSetDefaultMFA({
          payload: {
            mfa_type: mfaMethod,
          },
        })
          .then((res) => {
            toast.dismiss("info");
            setIsShowOtpModalConfirmation(false);
            geTypeMfa();
            toast("Penggantian MFA berhasil", {
              type: "success",
              toastId: "success",
            });
            setTimeout(() => {
              router.replace({
                pathname: handleRoute("set-mfa/success"),
                query: { ...router.query },
              });
            }, 2500);
          })
          .catch((err) => {
            setIsShowOtpModalConfirmation(false);
            toast.dismiss("info");
            toast.error(err.response?.data?.message || "Terjadi kesalahan", {
              icon: <XIcon />,
            });
          });
      } else {
        toast("Metode otentikasi anda sudah OTP", {
          type: "info",
          toastId: "info",
          position: "top-center",
          style: {
            backgroundColor: themeConfiguration?.data.toast_color as string,
          },
        });
        setIsShowOtpModalConfirmation(false);
      }
    }
  };

  const geTypeMfa = () => {
    getUserName()
      .then((res) => {
        const data = JSON.parse(res.data);
        setDefaultMfa(data?.typeMfa?.toLowerCase());
        setMfaMethod(data?.typeMfa?.toLowerCase());
      })
      .catch((err) => {
        throw err;
      });
  };

  useEffect(() => {
    if (!router.isReady) return;
    setIsShowpage(true);
    geTypeMfa();
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    isShowPage && (
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
          <title>{t("setMFA.title")}</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <div className="max-w-md mx-auto px-2 pt-8 sm:w-full md:w-4/5">
          <Heading className="pb-6">{t("setMFA.title")}</Heading>
          <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs poppins-regular text-blue500 ml-4">
              {i18n.language === "en" ? (
                t("choosetAutheticantionModeInformation.dontHaveDefaultMfa")
              ) : (
                <>
                  Untuk meningkatkan keamanan, diperlukan{" "}
                  <em>Multi Factor Authentication</em> yang harus Anda gunakan
                  saat melakukan aktivitas tandatangan digital ataupun aktivitas
                  lainnya di tilaka.id. Silakan pilih metode MFA yang sesuai
                  dengan kenyamanan Anda.
                </>
              )}
            </p>
          </div>
          <div className="mt-6">
            <label className="flex cursor-pointer items-center">
              <input
                name="mfa_method"
                value="fr"
                onChange={handleFormOnChange}
                checked={mfaMethod === "fr"}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">Face Recognition</Paragraph>
            </label>
            <label className="flex cursor-pointer items-center mt-3.5">
              <input
                name="mfa_method"
                value="otp"
                onChange={handleFormOnChange}
                checked={mfaMethod === "otp"}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">OTP via Email</Paragraph>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                disabled
                name="mfa_method"
                value="mfa_method_otp_ponsel"
                type="radio"
                className="appearance-none w-4 h-4 ring-1 bg-neutral40 ring-neutral50 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5 poppins-regular">
                {t("autheticantionMode3")}{" "}
                <span className="text-sm text-white bg-neutral80 px-2 py-1 rounded">
                  {t("setMFA.notAvaliableFiture")}
                </span>
              </Paragraph>
            </label>
          </div>
          <div className="justify-center flex-col-reverse md:flex-row flex gap-3 md:justify-end mt-10">
            <Button
              onClick={() => setMfaMethod(defaultMfa)}
              className="mx-0"
              size="none"
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => onClickHandler("confirmation")}
              disabled={defaultMfa === mfaMethod || isDisabled}
              size="lg"
              className="py-2 mx-0 whitespace-nowrap"
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.button_color as string
                ),
              }}
            >
              {t("setMFA.submitBtn")}
            </Button>
          </div>
          <FRModal
            isShowModalFr={isShowModalFr}
            setShowModalFr={setShowModalFr}
            geTypeMfa={geTypeMfa}
            setIsDisabled={setIsDisabled}
          />
          <OtpModalConfirmation
            isShowOtpModalConfirmation={isShowOtpModalConfirmation}
            setIsShowOtpModalConfirmation={setIsShowOtpModalConfirmation}
            onClickHandler={onClickHandler}
            setIsDisabled={setIsDisabled}
            isDisabled={isDisabled}
          />
          <div className="mt-16">
            <Footer />
          </div>
        </div>
      </div>
    )
  );
};

const FRModal = ({
  isShowModalFr,
  setShowModalFr,
  geTypeMfa,
  setIsDisabled,
}: IModalFR) => {
  const { t }: any = i18n;
  const dispatch: AppDispatch = useDispatch();

  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const doRedirect = (path: string) => {
    router.replace({
      pathname: handleRoute(path),
      query: { ...router.query },
    });
  };

  const captureProcessor = (base64Img: string | null | undefined) => {
    const payload = {
      face_image: base64Img?.split(",")[1] as string,
    };

    setIsLoading(true);

    RestPersonalFaceRecognitionV2({ payload })
      .then((res) => {
        if (res.success) {
          restSetDefaultMFA({
            payload: {
              mfa_type: "otp",
            },
          }).then((res) => {
            toast.dismiss("info");
            setIsFRSuccess(true);
            setShowModalFr(false);
            setIsDisabled(true);
            setIsLoading(false);
            toast("Penggantian MFA berhasil", {
              type: "success",
              toastId: "success",
            });
            geTypeMfa();
            setTimeout(() => {
              router.replace({
                pathname: handleRoute("set-mfa/success"),
                query: { ...router.query },
              });
            }, 2500);
          });
        } else {
          setIsFRSuccess(false);
          setIsLoading(false);
          toast.dismiss("info");
          const doCounting: number = getFRFailedCount("set_mfa_count") + 1;
          setFRFailedCount("set_mfa_count", doCounting);
          const newCount: number = getFRFailedCount("set_mfa_count");
          if (newCount >= 5) {
            dispatch(resetInitalState());
            toast.error("Anda sudah gagal FR 5 kali", { icon: <XIcon /> });
            setFRFailedCount("set_mfa_count", 0);
            localStorage.removeItem("token");
            doRedirect("login");
          } else {
            toast.error(res.message, { icon: <XIcon /> });
            setShowModalFr(false);
            setTimeout(() => {
              setShowModalFr(true);
            }, 100);
          }
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setShowModalFr(false);
        toast.dismiss("info");
        toast.error(err.response?.data?.message || "Gagal validasi wajah", {
          icon: <XIcon />,
        });
      });
  };

  return (
    <FaceRecognitionModal
      isShowModal={isShowModalFr}
      isDisabled={isLoading}
      setIsShowModal={setShowModalFr}
      callbackCaptureProcessor={captureProcessor}
      title={t("setMFA.modal.title")}
    />
  );
};

const OtpModalConfirmation = ({
  setIsShowOtpModalConfirmation,
  isShowOtpModalConfirmation,
  onClickHandler,
  isDisabled,
  setIsDisabled,
}: IOtpModalConfrimation) => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  return isShowOtpModalConfirmation ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className={`fixed z-50 flex items-center transition-all poppins-regular duration-1000 justify-center w-full left-0 top-0 h-full`}
    >
      <div className="bg-white max-w-sm px-2 pb-4 rounded-xl w-full mx-5">
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
        <div className="poppins-regular justify-center items-center flex-col-reverse flex gap-3  mt-5">
          <Button
            variant="ghost"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
            onClick={() => {
              setIsDisabled(false);
              setIsShowOtpModalConfirmation(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            size="none"
            className="py-2.5"
            disabled={isDisabled}
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
            onClick={() => onClickHandler("submit")}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default SetMfa;
