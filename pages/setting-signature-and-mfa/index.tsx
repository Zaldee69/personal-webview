import {
  restSetDefaultSignature,
  restSetDefaultMFA,
  getUserName,
} from "infrastructure/rest/b2b";
import { useState, useRef, useEffect } from "react";
import SignaturePad from "../../components/SignaturePad";
import InfoIcon from "../../public/icons/InfoIcon";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import { handleRoute } from "@/utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import Button from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Footer from "@/components/Footer";
import { assetPrefix } from "next.config";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

type Props = {};

type Tform = {
  signature_type: 0 | 1;
  signature_font_type?:
    | "Adine-Kirnberg"
    | "champignonaltswash"
    | "FormalScript"
    | "HerrVonMuellerhoff-Regular"
    | "MrsSaintDelafield-Regular"
    | "SCRIPTIN"
    | "";
  mfa_method: "fr" | "otp" | "otp_ponsel";
};

function SettingSignatureAndMFA({}: Props) {
  const [form, formSetter] = useState<Tform>({
    signature_type: 1,
    signature_font_type: "",
    mfa_method: "fr",
  });
  const [imageURL, setImageURL] = useState<string>();
  const [data, setData] = useState<string>();
  let ref: any = null;
  const sigPad = useRef<any>();
  const router = useRouter();
  const { t }: any = i18n;
  const [showModalOtpPonsel, showModalOtpPonselSetter] =
    useState<boolean>(false);
  const [agreeOtpPonsel, agreeOtpPonselSetter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
    ref = e.currentTarget;

    if (ref.name !== "mfa_method" && ref.name !== "signature_type") {
      convertToDataURL();
    }
  };

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (router.isReady) {
      getUserName({}).then((res) => {
        const data = JSON.parse(res.data);
        setData(data.name);
      });
    }
  }, [router.isReady]);

  //Convert HTML element to base64 png
  const convertToDataURL = async () => {
    const canvas = await html2canvas(ref.parentNode.children[1], {
      height: 60,
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
    canvas.style.backgroundColor = "rgba(0, 0, 0, 0)";
    const image = canvas.toDataURL("image/png");
    setImageURL(image);
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    toast(`Loading...`, {
      type: "info",
      toastId: "info",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });
    setIsLoading(true)
    const signature_image = sigPad.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    const target = e.target as typeof e.target & {
      signature_type: { value: Tform["signature_type"] };
      signature_font_type: { value: Tform["signature_font_type"] };
      mfa_method: { value: Tform["mfa_method"] };
    };

    const signature_type = target.signature_type.value;
    const font_type = target.signature_font_type.value;
    const mfa_type = target.mfa_method.value;

    const payload = {
      signature_type,
      font_type: signature_type == 0 ? "" : font_type,
      signature_image:
        signature_type == 1 ? (imageURL as string) : signature_image,
    };

    if (
      (signature_type == 0 && sigPad.current.isEmpty()) ||
      (signature_type == 1 && !imageURL)
    ) {
      toast.dismiss("info");
      setIsLoading(false)
      toast(
        `${
          signature_type === 0 ? t("handwritingRequired") : t("FontRequired")
        }`,
        {
          type: "error",
          toastId: "error",
          position: "top-center",
          icon: XIcon,
        }
      );
    } else {
      restSetDefaultSignature({
        payload,
      })
        .then((res) => {
          if (res.success) {
            toast.dismiss("info");
            toast(res.message, {
              type: "success",
              toastId: "success",
            });
            if (router.query.setting === "1" && router.query.signing !== "1") {
              setTimeout(() => {
                toast.dismiss("success");
                router.replace({
                  pathname: handleRoute("link-account/success"),
                  query: { ...router.query },
                });
              }, 3000);
            } else {
              setTimeout(() => {
                toast.dismiss("success");
                router.replace({
                  pathname:
                    router.query.v2 === "1"
                      ? handleRoute("signing/v2")
                      : handleRoute("signing"),
                  query: { ...router.query },
                });
              }, 3000);
            }
          } else {
            toast.dismiss("info");
            setIsLoading(false)
            toast(res.message, {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
          }
        })
        .catch((err) => {
          setIsLoading(false)
          if (err.response?.status === 401) {
            toast.dismiss("info");
            toast("Anda harus login terlebih dahulu", {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
            router.replace({
              pathname: handleRoute("login"),
              query: { ...router.query },
            });
          } else {
            toast.dismiss("info");
            toast("Penggantian tanda tangan gagal", {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
          }
        });

      restSetDefaultMFA({
        payload: {
          mfa_type,
        },
      })
        .then((res) => {
          return res;
        })
        .catch((err) => {
          {
          }
        });
    }
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
        <title>{t("settingSignatureTitleAndMFA")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="p-4 max-w-md mx-auto">
        <Heading className="mt-2">
          {t("settingSignatureTitleAndMFA")}
        </Heading>
        <form onSubmit={handleFormOnSubmit}>
          <div
          className="bg-contain w-64 mx-auto my-5 h-64 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_activation_setting_signature_and_mfa as string,
              "ASSET",
              `${assetPrefix}/images/ttdSetting.svg`
            )})`,
          }}
        ></div>
          <Paragraph>
            {t("chooseSignature")}
          </Paragraph>
          <div className="mt-2 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs poppins-regular text-blue500 ml-4">
              {t("chooseSignatureInformation")}
            </p>
          </div>
          <div className="mt-5">
            <label className="flex items-center">
              <input
                name="signature_type"
                value={0}
                onChange={handleFormOnChange}
                checked={form.signature_type == 0}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">
                {t("signatureOption1")}
              </Paragraph>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                name="signature_type"
                value={1}
                onChange={handleFormOnChange}
                checked={form.signature_type == 1}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">
                {t("signatureOption2")}
              </Paragraph>
            </label>
          </div>
          <div className={form.signature_type == 0 ? undefined : "hidden"}>
            <SignaturePad sigPad={sigPad} />
          </div>
          <div className={form.signature_type == 1 ? undefined : "hidden"}>
            <div
              className={`grid  ${
                (data?.length as number) > 15 ? "grid-cols gap-5" : "grid-col-2"
              } gap-3 mt-5`}
            >
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="Adine-Kirnberg"
                  onChange={handleFormOnChange}
                  checked={form.signature_font_type === "Adine-Kirnberg"}
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="text-2xl Adine-Kirnberg text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="champignonaltswash"
                  onChange={handleFormOnChange}
                  checked={form.signature_font_type === "champignonaltswash"}
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="h-full champignonaltswash text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="FormalScript"
                  onChange={handleFormOnChange}
                  checked={form.signature_font_type === "FormalScript"}
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="text-lg FormalScript text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="HerrVonMuellerhoff-Regular"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type === "HerrVonMuellerhoff-Regular"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="h-full HerrVonMuellerhoff-Regular text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="MrsSaintDelafield-Regular"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type === "MrsSaintDelafield-Regular"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="h-full MrsSaintDelafield-Regular text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="SCRIPTIN"
                  onChange={handleFormOnChange}
                  checked={form.signature_font_type === "SCRIPTIN"}
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
                />
                <p className="h-full SCRIPTIN text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
            </div>
          </div>
          <Paragraph className="mt-8">
            {t("choosetAutheticantionMode")}
          </Paragraph>
          <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs poppins-regular text-blue500 ml-4">
              {i18n.language === "en" ? (
                t("choosetAutheticantionModeInformation")
              ) : (
                <>
                  Demi keamanan, diperlukan <i>Multi Factor Authentication</i>{" "}
                  yang harus Anda gunakan saat melakukan aktivitas tanda tangan
                  digital atau layanan Tilaka lainnya.
                </>
              )}
            </p>
          </div>
          <div className="mt-6">
            <label className="flex items-center hover:cursor-pointer">
              <input
                name="mfa_method"
                value="fr"
                onChange={handleFormOnChange}
                checked={form.mfa_method === "fr"}
                type="radio"
                className="appearance-none hover:cursor-pointer bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">
                Face Recognition
              </Paragraph>
            </label>
            <label className="flex items-center hover:cursor-pointer mt-3.5">
              <input
                name="mfa_method"
                value="otp"
                onChange={handleFormOnChange}
                checked={form.mfa_method === "otp"}
                type="radio"
                className="appearance-none hover:cursor-pointer bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <Paragraph className="ml-2.5">
                OTP via Email
              </Paragraph>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                disabled
                name="mfa_method"
                value="mfa_method_otp_ponsel"
                onChange={agreeOtpPonsel ? handleFormOnChange : undefined}
                onClick={
                  agreeOtpPonsel
                    ? undefined
                    : (_: React.MouseEvent<HTMLInputElement>) => {
                        showModalOtpPonselSetter(true);
                      }
                }
                checked={form.mfa_method === "otp_ponsel"}
                type="radio"
                className="appearance-none disabled:opacity-50 bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 poppins-regular opacity-50 text-_030326">
                {t("autheticantionMode3")}
              </p>
            </label>
          </div>
          <Button
            size="none"
            type="submit"
            className="mt-8 px-6 py-2.5 text-base bg-primary block mx-auto"
            disabled={isLoading}
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
          >
            {t("next")}
          </Button>
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
                    formSetter({ ...form, mfa_method: "otp_ponsel" });
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const isNotRedirect: boolean = true;
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

  return serverSideRenderReturnConditions({
    context,
    checkStepResult,
    isNotRedirect,
  });
};

export default SettingSignatureAndMFA;
