import i18n from "i18";
import { RestOTPDedicated, RestSigningAuthhashsign } from "infrastructure";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Button from "@/components/atoms/Button";
import Loader from "@/public/icons/Loader";
import Heading from "@/components/atoms/Heading";
import { GetServerSideProps } from "next";
import { IOTPDedicatedResponse } from "infrastructure/rest/personal/types";
import { toast } from "react-toastify";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";
import XIcon from "@/public/icons/XIcon";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { useResizeDetector } from "react-resize-detector";
import OTPInput from "@/components/OTPInput";

interface Props extends IOTPDedicatedResponse {
  id: string;
  user: string;
}

const PinFormDedicatedChannel = ({ id, user, success }: Props) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isCountDone, setIsCountDone] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("0");
  const [isProcessResend, setIsProcessResend] = useState<boolean>(false);
  const [isProcessVerify, setIsProcessVerify] = useState<boolean>(false);

  const interval = 60000;

  const router = useRouter();
  const { redirect_url } = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const { t }: any = i18n;

  const reset = () => {
    localStorage.endTime = +new Date() + interval;
  };

  const { width, ref } = useResizeDetector();

  const resendOTP = () => {
    setIsProcessResend(true);
    RestOTPDedicated({
      id,
      user,
    })
      .then((res) => {
        if (res.success) {
          timerHandler();
          reset();
          setIsCountDone(true);
          toast.success("OTP Terkirim", {
            icon: <CheckOvalIcon />,
          });
        } else {
          timerHandler();
          reset();
          setIsCountDone(true);
          toast.error(res.message, {
            icon: <XIcon />,
          });
        }
        setIsProcessResend(false);
      })
      .catch((err) => {
        console.log(err);
        setIsProcessResend(false);
        toast.error("Terjadi kesalahan, Mohon coba lagi.", {
          icon: <XIcon />,
        });
      });
  };

  const verifyOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otpValues.length < 6) return;

    setIsProcessVerify(true);

    RestSigningAuthhashsign({
      params: {
        id: id as string,
        user: user as string,
      },
      payload: {
        otp_pin: otpValues.join(""),
      },
    })
      .then((res) => {
        if (res.success) {
          toast.success("Penandatangan Berhasil", {
            icon: <CheckOvalIcon />,
          });
          const params = {
            user_identifier: res.data.tilaka_name,
            request_id: res.data.request_id,
            status: "Sukses",
            signing_id: id,
          };

          if (redirect_url) {
            const queryString = new URLSearchParams(params as any).toString();
            setTimeout(() => {
              window.top!.location.href = concateRedirectUrlParams(
                redirect_url as string,
                queryString
              );
            }, 2000);
          }
        } else {
          if (res.message === "authhashsign gagal. salah OTP sudah 5 kali") {
            toast.error(res.message, {
              icon: <XIcon />,
            });
            const params = {
              user_identifier: user,
              request_id: res.data.request_id,
              status: "Blocked",
              signing_id: id,
            };

            if (redirect_url) {
              const queryString = new URLSearchParams(params as any).toString();
              setTimeout(() => {
                window.top!.location.href = concateRedirectUrlParams(
                  redirect_url as string,
                  queryString
                );
              }, 2000);
            }
          } else {
            const ERROR_MESSAGE =
              res.message === "signing sudah selesai"
                ? t("signingComplete")
                : res.message;

            toast.error(ERROR_MESSAGE, {
              icon: <XIcon />,
            });
          }
          setIsProcessVerify(false);
          setOtpValues(["", "", "", "", "", ""]);
        }
      })
      .catch((err) => {
        toast.error("Terjadi kesalahan, Mohon coba lagi.", {
          icon: <XIcon />,
        });
        console.log(err);
      });
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

  useEffect(() => {
    if (success) {
      timerHandler();
      reset();
      setIsCountDone(true);
    } else {
      setIsCountDone(true);
      timerHandler();
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="flex justify-center items-center min-h-screen pt-3 pb-5"
    >
      <div
        ref={ref}
        className="h-96 px-6 pb-5 font-poppins w-[26rem] card-pin-form"
      >
        <Heading className="text-center">{t("frSubtitle2")}</Heading>
        <p className="text-center text-neutral200 mt-3 text-sm md:text-base whitespace-pre">
          {t("otpSubtitle")}
        </p>
        <form onSubmit={verifyOTP}>
          <OTPInput
            width={width!}
            setValues={setOtpValues}
            values={otpValues}
          />

          <div className="flex justify-center text-sm gap-1 mt-5">
            <p className="text-neutral200">{t("dindtReceiveOtp")}</p>
            <div
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string,
                  "BG"
                ),
              }}
              className="font-semibold"
            >
              {!isCountDone ? (
                <Button
                  variant="ghost"
                  type="button"
                  disabled={isProcessResend}
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className="mx-0"
                  size="none"
                  onClick={resendOTP}
                >
                  {isProcessResend ? (
                    <Loader color="#0052CC" size={20} />
                  ) : (
                    t("resend")
                  )}
                </Button>
              ) : (
                <p className="text-primary">{`0:${timeRemaining}`}</p>
              )}
            </div>
          </div>
          <Button
            disabled={otpValues.join("").length < 6 || isProcessVerify}
            type="submit"
            className="mt-16"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
          >
            {isProcessVerify ? (
              <div className="mx-auto flex justify-center">
                <Loader />
              </div>
            ) : (
              t("send")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const { id, user } = cQuery;

  const generateOTP = await RestOTPDedicated({
    user: user as string,
    id: id as string,
  })
    .then((res) => res)
    .catch((err) => {
      console.log(err);
    });

  return {
    props: {
      ...generateOTP,
      user,
      id,
    },
  };
};

export default PinFormDedicatedChannel;
