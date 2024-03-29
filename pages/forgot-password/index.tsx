import { Dispatch, SetStateAction, useRef, useState } from "react";
import { toast } from "react-toastify";
import XIcon from "../../public/icons/XIcon";
import Head from "next/head";
import ReCAPTCHA from "react-google-recaptcha";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { TPersonalRequestResetPasswordRequestData } from "infrastructure/rest/personal/types";
import { RestPersonalRequestResetPassword } from "infrastructure/rest/personal";
import Button from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

type Props = {};

type Tform = {
  email?: string;
  recaptcha_response?: string;
};

const ForgotPassword = (props: Props) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [form, formSetter] = useState<Tform>({});
  const [modalSuccess, modalSuccessSetter] = useState<boolean>(false);
  const [reCaptchaSuccess, reCaptchaSuccessSetter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({
      ...form,
      [e.currentTarget.name]: e.currentTarget.value.replace(/\s/g, ""),
    });
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    setIsLoading(true)
    toast(`Loading...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });

    const target = e.target as typeof e.target & {
      email: { value: Tform["email"] };
    };

    const email = target.email.value;

    const data: TPersonalRequestResetPasswordRequestData = {
      email: (email as string) || undefined,
      recaptcha_response: (form.recaptcha_response as string) || undefined,
    };

    RestPersonalRequestResetPassword({ payload: data })
    .then((res) => {
        setIsLoading(false)
        toast.dismiss("loading");
        if (res.success) {
          modalSuccessSetter(true);
          formSetter({})
        } else {
          toast.error(res.message || "Gagal request reset password", {
            icon: <XIcon />,
          });
        }

        resetCaptcha();
      })
      .catch((err) => {
        toast.dismiss("loading");
        setIsLoading(false)
        if (
          err.response?.data?.message &&
          err.response?.data?.data?.errors?.[0]
        ) {
          toast.error(
            `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
            {
              icon: <XIcon />,
            }
          );
        } else {
          toast.error(
            err.response?.data?.message ||
              "Kesalahan pada saat request reset password",
            {
              icon: <XIcon />,
            }
          );
        }

        resetCaptcha();
      });
  };

  const handleOnChangeReCaptcha = (value: string | null): void => {
    if (value === null) reCaptchaSuccessSetter(false);
    reCaptchaSuccessSetter(true);
    formSetter({ ...form, recaptcha_response: value as string });
  };

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    reCaptchaSuccessSetter(false);
    formSetter({ ...form, recaptcha_response: undefined });
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
        <title>{t("forgotPassword.title")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-9 max-w-md items-center mx-auto flex flex-col justify-between">
        <div className="w-full px-5">
          <Heading>{t("forgotPassword.title")}</Heading>
          <div
            className="bg-contain w-52 mx-auto my-6 h-52 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_forget_password as string,
                "ASSET",
                `${assetPrefix}/images/forgotPassword.svg`
              )})`,
            }}
          ></div>

          <div className="flex justify-center" style={{ minHeight: "180px" }}>
            {reCaptchaSuccess ? (
              <div className="w-full">
                <form onSubmit={handleFormOnSubmit}>
                  <label className="block mt-4">
                    <div className="flex justify-start items-center">
                      <Paragraph size="sm" className="pl-2.5">
                        Email
                      </Paragraph>
                    </div>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="email"
                        placeholder={t("forgotPassword.placeholder")}
                        value={form.email}
                        onChange={handleFormOnChange}
                        className="px-2.5 py-3 w-full focus:outline-none text-sm text-neutral800 placeholder:text-neutral50 font-poppins border border-neutral40 rounded-md"
                      />
                    </div>
                  </label>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!form.email || isLoading}
                    className="mt-32  mb-5 h-10"
                    style={{
                      backgroundColor: themeConfigurationAvaliabilityChecker(
                        themeConfiguration?.data.button_color as string
                      ),
                    }}
                  >
                    {t("send")}
                  </Button>
                </form>
              </div>
            ) : (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={
                  process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || "wrong-sitekey"
                }
                onChange={handleOnChangeReCaptcha}
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
      <ModalSuccess modal={modalSuccess} setModal={modalSuccessSetter} />
    </div>
  );
};

export default ForgotPassword;

const ModalSuccess: React.FC<{
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
}> = ({ modal, setModal }) => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-center transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 px-3 pt-7 pb-4 rounded-xl w-full mx-5">
        <p className="font-poppins block text-center pb-5  whitespace-nowrap  font-semibold ">
          {t("emailWasSend")}
        </p>
        <div
          className="bg-contain w-12 h-12 bg-center mx-auto bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_forget_password_email_sent as string,
              "ASSET",
              `${assetPrefix}/images/checkCircle.svg`
            )})`,
          }}
        ></div>
        <p className="text-neutral800 text-base font-normal mt-8 font-poppins text-center">
          {t("checkEmail")}
        </p>
        <Button
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.action_font_color as string
            ),
          }}
          onClick={() => setModal(false)}
          className="text-neutral80 font-poppins font-medium w-full mt-14 mx-auto rounded-sm py-2"
        >
          {t("close")}
        </Button>
      </div>
    </div>
  ) : null;
};
