import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { AppDispatch, RootState } from "@/redux/app/store";
import Camera from "@/components/Camera";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  RestKycCheckStep,
  RestKycFinalForm,
  RestKycGenerateAction,
  RestKycVerification,
} from "infrastructure";
import {
  TKycCheckStepResponseData,
  TKycVerificationRequestData,
} from "infrastructure/rest/kyc/types";
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";
import Footer from "@/components/Footer";
import ProgressStepBar from "@/components/ProgressStepBar";
import {
  resetImages,
  setActionList,
  setIsDone,
  setIsRetry,
} from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";
import Loading from "@/components/Loading";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import Guide from "@/components/Guide";
import { assetPrefix } from "next.config";
import {
  RestResendOTPRegistration,
  RestVerifyOTPRegistration,
} from "infrastructure/rest/personal";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Button from "@/components/atoms/Button";
import { TOTPResponse } from "infrastructure/rest/personal/types";
import Loader from "@/public/icons/Loader";
import Heading from "@/components/atoms/Heading";
import LivenessImagePreview from "@/components/LivenessImagePreview";
import { ActionGuide1, ActionGuide2 } from "@/components/atoms/ActionGuide";
import { cn } from "@/utils/twClassMerge";
import { actionText } from "@/utils/actionText";
import UnsupportedDeviceModal from "@/components/UnsupportedDeviceModal";
import { useResizeDetector } from "react-resize-detector";
import OTPInput from "@/components/OTPInput";

export type TQueryParams = {
  request_id?: string;
  redirect_url?: string;
  reason_code?: string;
  uuid?: string;
  status?: string;
};

type Props = {
  uuid: string;
  checkStepResult: TKycCheckStepResponseData;
} & TOTPResponse;

let human: any = undefined;

const Liveness = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isStepDone, setStepDone] = useState<boolean>(false);
  const [isGenerateAction, setIsGenerateAction] = useState<boolean>(true);
  const [isMustReload, setIsMustReload] = useState<boolean>(false);
  const [isLivenessStarted, setIsLivenessStarted] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [humanDone, setHumanDone] = useState(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [isCreateOTPSuccess, setIsCreateOTPSuccess] = useState<boolean>(false);
  const [processRegister, setProcessRegister] = useState<boolean>(false);

  const actionList = useSelector(
    (state: RootState) => state.liveness.actionList
  );
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  const currentIndex =
    actionList[currentActionIndex] === "look_straight"
      ? "hadap-depan"
      : actionList[currentActionIndex] === "mouth_open"
      ? "buka-mulut"
      : actionList[currentActionIndex] === "blink"
      ? "pejam"
      : "hadap-depan";

  const imageSrc1 = themeConfigurationAvaliabilityChecker(
    currentIndex === "hadap-depan"
      ? (themeConfiguration.data.asset_liveness_action_selfie as string)
      : currentIndex === "buka-mulut"
      ? (themeConfiguration.data.asset_liveness_action_open_mouth as string)
      : (themeConfiguration.data.asset_liveness_action_blink as string),
    "ASSET",
    `${assetPrefix}/images/${currentIndex}.svg`
  );

  const imageSrc2 = themeConfigurationAvaliabilityChecker(
    currentIndex === "hadap-depan" || !isStepDone
      ? (themeConfiguration.data.asset_liveness_action_selfie as string)
      : currentIndex === "buka-mulut"
      ? (themeConfiguration.data.asset_liveness_action_open_mouth as string)
      : (themeConfiguration.data.asset_liveness_action_blink as string),
    "ASSET",
    `${assetPrefix}/images/${currentIndex}.svg`
  );

  useEffect(() => {
    const track: any = document.querySelector(".track");
    if (progress === 100) {
      track?.classList?.add("white-stroke");
      setTimeout(() => {
        setStepDone(true);
        track?.classList?.remove("white-stroke");
      }, 2000);
    }
  }, [progress]);

  const dispatch: AppDispatch = useDispatch();

  const handleSuccessCreateOTP = () => {
    setIsCreateOTPSuccess(true);
    generateAction();
    dispatch(resetImages());
  };

  const generateAction = () => {
    setIsDisabled(true);
    const body = {
      registerId: routerQuery.request_id as string,
    };
    toast(`Memuat aksi...`, {
      type: "info",
      toastId: "generateAction",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });
    RestKycGenerateAction(body)
      .then((result) => {
        setIsDisabled(false);
        if (result?.data) {
          const payload = ["look_straight"].concat(result.data.actionList);
          dispatch(setActionList(payload));
          toast(`${result.message}`, {
            type: "success",
            position: "top-center",
            autoClose: 3000,
          });
          toast.dismiss("generateAction");
          setIsGenerateAction(false);
        } else {
          setIsGenerateAction(false);
          throw new Error(result.message);
        }
      })
      .catch((error) => {
        toast.dismiss("generateAction");
        const msg = error.response?.data?.data?.errors?.[0];
        if (msg) {
          if (msg === "Proses ekyc untuk registrationId ini telah sukses") {
            toast(`${msg}`, {
              type: "success",
              position: "top-center",
              autoClose: 3000,
            });
            setIsGenerateAction(false);
          } else {
            toast.error(msg, {
              icon: <XIcon />,
            });
            setIsGenerateAction(false);
          }
        } else {
          setIsGenerateAction(false);
          toast.error(
            error.response?.data?.message || "Generate Action gagal",
            {
              icon: <XIcon />,
            }
          );
        }
      });
  };

  const finalForm = (reason_code?: string | null) => {
    const query: any = {
      ...routerQuery,
      registration_id: router.query.request_id,
    };

    const params = {
      register_id: props.uuid,
      request_id: props.uuid,
      status: "S",
      reason_code: "",
    };

    if (reason_code) {
      query.reason_code = reason_code;
    }

    RestKycFinalForm({
      payload: {
        registerId: props.uuid,
      },
    })
      .then((res) => {
        if (res.success) {
          params.reason_code = res.data.reason_code!;
          if (routerQuery.redirect_url) {
            const queryString = new URLSearchParams(params as any).toString();

            window.top!.location.href = concateRedirectUrlParams(
              routerQuery.redirect_url as string,
              queryString
            );
          } else {
            if (res.data.reason_code === "1") {
              return router.replace({
                pathname: handleRoute("register"),
                query: {
                  ...query,
                  step: "liveness-failure",
                },
              });
            }

            router.replace({
              pathname: handleRoute("register"),
              query: {
                ...query,
                step: "form-success",
              },
            });
          }
        }
      })
      .catch((err) => console.log(err));
  };

  const changePage = async () => {
    setIsLoading(true);
    setFailedMessage("");

    dispatch(setIsDone(false));
    setCurrentActionIndex(2);
    dispatch(setIsRetry(false));

    localStorage.setItem(
      routerQuery.request_id as string,
      props.checkStepResult.data.token as string
    );

    try {
      const body: TKycVerificationRequestData = {
        registerId: router.query.request_id as string,
        mode: "web",
        image_action1: "",
        image_action2: "",
        image_action3: "",
        image_selfie: "",
      };

      const imageActions = images.filter(
        (image) =>
          image.step === "Liveness Detection" &&
          image.action !== "look_straight"
      );
      imageActions.forEach((image, index) => {
        body[`image_action${++index}` as keyof TKycVerificationRequestData] =
          image.value;
      });
      const imageSelfie = images.filter(
        (image) => image.action === "look_straight"
      )[0];

      body.image_selfie = imageSelfie.value;

      const result = await RestKycVerification(body);
      const status = result.data.status;
      if (result.success) {
        removeStorage();
        if (result.data.config_level === 2) {
          try {
            const finalFormResponse = await RestKycFinalForm({
              payload: { registerId: router.query.request_id as string },
            });

            if (finalFormResponse.success) {
              toast.success(finalFormResponse?.message || "berhasil", {
                icon: <CheckOvalIcon />,
              });

              // Redirect berdasarkan redirect-url
              const params: TQueryParams = {
                request_id: routerQuery.request_id as string,
              };

              if (routerQuery.redirect_url) {
                params.redirect_url = routerQuery.redirect_url as string;
              }

              if (finalFormResponse.data.reason_code) {
                params.reason_code = finalFormResponse.data.reason_code;
              }

              const queryString = new URLSearchParams(params as any).toString();
              const { hostname } = new URL(routerQuery.dashboard_url as string);

              if (hostname === "tilaka.id" || hostname.endsWith("tilaka.id")) {
                window.top!.location.href = concateRedirectUrlParams(
                  routerQuery.dashboard_url as string,
                  queryString
                );
              }
            } else {
              toast.error(finalFormResponse?.message || "gagal", {
                icon: <XIcon />,
              });
            }
          } catch (e: any) {
            if (e.response?.data?.data?.errors?.[0]) {
              toast.error(
                `${e.response?.data?.message}, ${e.response?.data?.data?.errors?.[0]}`,
                { icon: <XIcon /> }
              );
            } else {
              toast.error(e.response?.data?.message || "gagal", {
                icon: <XIcon />,
              });
            }
          }
        } else {
          finalForm(result.data.reason_code);
        }
      } else {
        const attempt =
          result.data?.numFailedLivenessCheck ||
          parseInt(localStorage.getItem("tlk-counter") as string) + 1;
        localStorage.setItem("tlk-counter", attempt.toString());
        if (status !== "E" && status !== "F") {
          toast("Liveness Detection failed. Please try again", {
            type: "error",
            autoClose: 5000,
            position: "top-center",
          });

          const query: TQueryParams = {
            ...routerQuery,
            request_id: router.query.request_id as string,
          };

          if (result.data.reason_code) {
            query.reason_code = result.data.reason_code;
          }

          router.push({
            pathname: handleRoute("register"),
            query: {
              ...query,
              step: "liveness-fail",
            },
          });
        } else {
          if (status) {
            if (status === "E") {
              removeStorage();
              toast(
                "We are unable to find your data in Dukpacil. For further assistance, please contact admin@tilaka.id",
                {
                  type: "error",
                  autoClose: 5000,
                  position: "top-center",
                }
              );
              // setIsLoading(false);
            } else if (status === "F") {
              toast(
                result?.data?.numFailedLivenessCheck &&
                  result?.data?.numFailedLivenessCheck > 2
                  ? "You have failed 3 times \nYou will be redirected to the next page, please wait..."
                  : "Registration Gagal",
                {
                  type: "error",
                  autoClose: 5000,
                  position: "top-center",
                }
              );
              setTimeout(() => {
                if (result.data.config_level === 2) {
                  const params: TQueryParams = {
                    request_id: routerQuery.request_id as string,
                  };

                  if (routerQuery.redirect_url) {
                    params.redirect_url = routerQuery.redirect_url as string;
                  }

                  if (result?.data.reason_code) {
                    params.reason_code = result?.data.reason_code as string;
                  }

                  const queryString = new URLSearchParams(
                    params as any
                  ).toString();
                  const { hostname } = new URL(
                    routerQuery.dashboard_url as string
                  );

                  if (
                    hostname === "tilaka.id" ||
                    hostname.endsWith("tilaka.id")
                  ) {
                    window.top!.location.href = concateRedirectUrlParams(
                      routerQuery.dashboard_url as string,
                      queryString
                    );
                  }
                } else if (result.data.pin_form && routerQuery.redirect_url) {
                  const params: any = {
                    status: status,
                    register_id: routerQuery.request_id,
                    request_id: routerQuery.request_id,
                  };

                  if (result?.data.reason_code) {
                    params.reason_code = result?.data.reason_code;
                  }

                  const queryString = new URLSearchParams(
                    params as any
                  ).toString();
                  window.top!.location.href = concateRedirectUrlParams(
                    routerQuery.redirect_url as string,
                    queryString
                  );
                } else {
                  const query: any = {
                    ...routerQuery,
                    request_id: router.query.request_id,
                  };

                  if (result?.data.reason_code) {
                    query.reason_code = result?.data.reason_code;
                  }

                  if (result.data.pin_form) {
                    router.push({
                      pathname: handleRoute("register"),
                      query: {
                        status: status,
                        register_id: routerQuery.request_id,
                        request_id: routerQuery.request_id,
                        step: "liveness-failure",
                      },
                    });
                  } else {
                    router.push({
                      pathname: handleRoute("register"),
                      query: {
                        ...query,
                        step: "liveness-failure",
                      },
                    });
                  }
                }
              }, 1000);
            }
          }
        }
      }
      localStorage.removeItem((routerQuery.request_id + "c") as string);
    } catch (e) {
      localStorage.removeItem((routerQuery.request_id + "c") as string);
      toast.dismiss("verification");
      toast(`${e || "Tidak merespon!"}`, {
        type: "error",
        autoClose: e ? 5000 : false,
        position: "top-center",
      });
      // setIsLoading(false);
      setTimeout(() => {
        router.push({
          pathname: handleRoute("register"),
          query: {
            ...routerQuery,
            request_id: router.query.request_id,
            step: "liveness-fail",
          },
        });
      }, 1000);
    }
  };

  const removeStorage = () => {
    localStorage.removeItem("tlk-reg-id");
    localStorage.removeItem("tlk-counter");
  };

  const setHumanReady = () => {
    const loading: any = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
    }
  };

  useEffect(() => {
    const initHuman = async () => {
      const humanConfig: any = {
        // user configuration for human, used to fine-tune behavior
        backend: "webgl",
        modelBasePath: assetPrefix ? `${assetPrefix}/models` : "/models",
        filter: { enabled: false, equalization: false },
        face: {
          enabled: true,
          detector: { rotation: true },
          mesh: { enabled: true },
          iris: { enabled: true },
          description: { enabled: true },
          emotion: { enabled: false },
        },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: true, maxDetected: 2 },
        gesture: { enabled: true },
        debug: false,
      };
      import("@vladmandic/human").then((H) => {
        human = new H.default(humanConfig);
        human.warmup().then(() => {
          setHumanDone(true);
        });
      });
    };
    initHuman();
  }, []);

  useEffect(() => {
    if (!humanDone && isClicked) {
      toast.dismiss();
      toast(`Loading...`, {
        type: "info",
        toastId: "load",
        isLoading: true,
        position: "top-center",
        style: {
          backgroundColor: themeConfiguration?.data.toast_color as string,
        },
      });
      setIsDisabled(true);
    } else if (humanDone && isClicked) {
      toast.dismiss("load");
      setIsLivenessStarted(true);
    }
  }, [isClicked, humanDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!router.isReady) return;
    if (
      props.verified &&
      props.checkStepResult.success &&
      !props.checkStepResult.data.reason_code &&
      props.checkStepResult.data.status !== "D"
    ) {
      generateAction();
      dispatch(resetImages());
    } else {
      setIsDisabled(true);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLivenessStarted) {
    if (
      !isCreateOTPSuccess &&
      !props.verified &&
      props.message !== "request_id tidak valid"
    ) {
      return <OTP handleSuccessCreateOTP={handleSuccessCreateOTP} {...props} />;
    } else {
      return <Guide setIsClicked={setIsClicked} isDisabled={isDisabled} />;
    }
  }

  if (isDone && !isLoading) {
    return (
      <LivenessImagePreview
        setCurrentActionIndex={setCurrentActionIndex}
        verifyLiveness={changePage}
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
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-10 max-w-sm mx-auto px-2">
        <h2 className="poppins-regular text-xl font-semibold">Liveness</h2>
        {!isStepDone && actionList.length > 1 ? (
          <ActionGuide2
            imageSrc={imageSrc2}
            isGenerateAction={isGenerateAction}
            isMustReload={isMustReload}
          />
        ) : (
          <div>
            {!isLoading && (
              <ActionGuide1
                actionList={actionList}
                imageSrc={imageSrc1}
                currentActionIndex={currentActionIndex}
                failedMessage={failedMessage}
                actionText={actionText}
              />
            )}
          </div>
        )}
        <div
          className={cn(
            "mt-5 rounded-md h-[270px] justify-center items-center sm:w-full md:w-full",
            {
              flex: isLoading,
              hidden: !isLoading,
            }
          )}
        >
          <Loading title={t("loadingTitle")} />
        </div>
        <div
          className={cn("relative", {
            block: !isLoading,
            hidden: isLoading,
          })}
        >
          <Camera
            currentActionIndex={currentActionIndex}
            setCurrentActionIndex={setCurrentActionIndex}
            currentStep="Liveness Detection"
            setFailedMessage={setFailedMessage}
            setProgress={setProgress}
            setHumanReady={setHumanReady}
            humanDone={humanDone}
            human={human}
          />
        </div>
        <ProgressStepBar
          actionList={actionList}
          currentActionIndex={isStepDone ? currentActionIndex : 0}
        />
        <UnsupportedDeviceModal />
        <Footer />
      </div>
    </div>
  );
};

interface IOTPProps extends Props {
  handleSuccessCreateOTP: () => void;
}

const OTP = ({ success, uuid, handleSuccessCreateOTP }: IOTPProps) => {
  const [isShowOTPForm, setIsShowOTPForm] = useState<boolean>(true);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isCountDone, setIsCountDone] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("0");
  const [isMaxResend, setIsMaxResend] = useState<boolean>(false);
  const [isProcessResend, setIsProcessResend] = useState<boolean>(false);
  const [isProcessVerify, setIsProcessVerify] = useState<boolean>(false);

  const interval = 60000;

  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const { t }: any = i18n;

  const reset = () => {
    localStorage.endTime = +new Date() + interval;
  };

  const { width, ref } = useResizeDetector();

  const resendOTP = () => {
    setIsProcessResend(true);
    RestResendOTPRegistration({ request_id: uuid })
      .then((res) => {
        const errorMessage =
          res.message === "tidak bisa resend OTP. resend OTP sudah maksimal" &&
          !res.success
            ? "Jumlah pengiriman kode OTP telah mencapai batas maksimal"
            : res.message;

        if (res.success) {
          timerHandler();
          reset();
          setIsCountDone(true);
          toast.success("OTP Terkirim", {
            icon: <CheckOvalIcon />,
          });
        } else {
          if (
            res.message === "tidak bisa resend OTP. resend OTP sudah maksimal"
          ) {
            setIsMaxResend(true);
          } else {
            timerHandler();
            reset();
            setIsCountDone(true);
          }
          toast.error(errorMessage, {
            icon: <XIcon />,
          });
        }
        setIsProcessResend(false);
      })
      .catch((err) => {
        console.log(err);
        setIsProcessResend(false);
      });
  };

  const verifyOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otpValues.length < 6) return;

    setIsProcessVerify(true);
    RestVerifyOTPRegistration({
      payload: {
        otp: otpValues.join(""),
        request_id: uuid,
      },
    })
      .then((res) => {
        if (res.success) {
          setIsShowOTPForm(false);
          handleSuccessCreateOTP();
        } else {
          setIsProcessVerify(false);
          setOtpValues(["", "", "", "", "", ""]);
          toast.error(
            res.message === "verifikasi gagal. OTP salah"
              ? "Kode OTP Salah"
              : res.message,
            {
              icon: <XIcon />,
            }
          );
        }
      })
      .catch((err) => {
        setIsProcessVerify(false);
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

  return !isShowOTPForm ? null : (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="flex justify-center items-center min-h-screen px-3 pt-3 pb-5"
    >
      <div
        ref={ref}
        className="py-9 font-poppins max-w-md card-pin-form flex items-center"
      >
        <div>
          <Heading className="text-center">{t("frSubtitle2")}</Heading>
          <p className="text-center text-sm md:text-base text-neutral200 mt-2">
            {t("OTPModalSubtitle")}
          </p>
          <form onSubmit={verifyOTP}>
            <OTPInput
              width={width!}
              setValues={setOtpValues}
              values={otpValues}
            />
            {isMaxResend ? (
              <p className="text-center mt-2 text-sm text-red300">
                {t("OTPResendMaxLimit")}
              </p>
            ) : (
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
            )}
            <Button
              disabled={otpValues.join("").length < 6 || isProcessVerify}
              type="submit"
              className="mt-10"
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
    </div>
  );
};

export default Liveness;