import PinFormComponent from "@/components/PinFormComponent";
import i18n from "i18";
import { RestSigningAuthhashsign } from "infrastructure";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { SigningFailure, SigningSuccess } from ".";

type Props = {};

type TUrlQuery = {
  random?: "1";
  user?: string;
  id?: string;
  redirect_url?: string;
  token?: string; // for setPassword after success manual form
};

const PinFormDedicatedChannel = (props: Props) => {
  const router = useRouter();
  const { t } = i18n;
  const {
    random,
    user,
    id,
    redirect_url,
    token,
    ...restRouterQuery
  }: NextParsedUrlQuery & TUrlQuery = router.query;
  const isRandom: boolean = random === "1";
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [pinConfirmError, setPinConfirmError] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [pinConfirmErrorAfterSubmit, setPinConfirmErrorAfterSubmit] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [isConfirmMode, setIsConfirmMode] = useState<boolean>(false);
  const [isButtonNumberDisabled, setIsButtonNumberDisabled] =
    useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<"-1" | "0" | "1">("-1");

  const digitLength: number = 6;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const onClickNumberHandlerCallback = (value: number) => {};
  const onClickDeleteHandlerCallback = () => {};
  const submitFormCallback = (pin: string) => {
    setPin(pin);
    setIsConfirmMode(true);
  };
  const onClickNumberHandlerConfirmCallback = (value: number) => {
    setPinConfirmError({ isError: false, message: "" });
  };
  const onClickDeleteHandlerConfirmCallback = () => {
    setIsButtonNumberDisabled(false);
    setPinConfirmError({ isError: false, message: "" });
  };
  const submitFormConfirmCallback = (pinConfirm: string) => {
    setIsButtonNumberDisabled(true);
    setIsProcessed(true);

    if (pin !== pinConfirm) {
      setPinConfirmErrorAfterSubmit({
        isError: true,
        message: t("confirmPinDoesntMatch"),
      });
      setIsProcessed(false);
      return;
    }

    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });

    RestSigningAuthhashsign({
      params: {
        id: id as string,
        user: user as string,
      },
      payload: {
        pin,
        // token: "?"
      },
    })
      .then((res) => {
        if (res.success) {
          setIsConfirmMode(false);
          setIsButtonNumberDisabled(false);
          setIsProcessed(false);
          router.push(
            {
              pathname: router.pathname,
              query: {
                ...router.query,
                user_identifier: res.data.tilaka_name,
                request_id: res.data.request_id,
                hmac_nonce: res.data.hmac_nonce,
              },
            },
            undefined,
            { shallow: true }
          );
          setIsSuccess("1");
        } else {
          setPinConfirmError({
            isError: true,
            message: res?.message || "gagal",
          });
          setIsButtonNumberDisabled(true);
          setIsProcessed(false);

          // setIsSuccess("0");
        }
      })
      .catch((err) => {
        if (err.response?.data?.data?.errors?.[0]) {
          setPinConfirmError({
            isError: true,
            message: `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
          });
        } else {
          setPinConfirmError({
            isError: true,
            message: err.response?.data?.message || "gagal",
          });
        }
        setIsButtonNumberDisabled(true);
        setIsProcessed(false);

        // setIsSuccess("0");
      });
  };

  const onClickBack = (_: React.SyntheticEvent) => {
    setPin("");
    setPinError({ isError: false, message: "" });
    setPinConfirmError({ isError: false, message: "" });
    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });
    setIsConfirmMode(false);
    setIsButtonNumberDisabled(false);
    setIsProcessed(false);
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return;

  if (isSuccess === "1") {
    return <SigningSuccess />;
  } else if (isSuccess === "0") {
    return <SigningFailure />;
  }

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="flex justify-center items-center min-h-screen px-3 pt-3 pb-5"
    >
      {isConfirmMode ? (
        <div className="max-w- w-full" style={{ maxWidth: "331px" }}>
          <PinFormComponent
            key="pinFormConfirmKey"
            title={t("confirmPinTitle")}
            subTitle={t("confirmPinSubtitle")}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerConfirmCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerConfirmCallback}
            submitFormCallback={submitFormConfirmCallback}
            isResetAfterSubmit={false}
            isErrorAfterSubmit={pinConfirmErrorAfterSubmit.isError}
            isErrorAfterSubmitMessage={pinConfirmErrorAfterSubmit.message}
            isError={pinConfirmError.isError}
            isErrorMessage={pinConfirmError.message}
            isButtonNumberDisabled={isButtonNumberDisabled}
            isProcessed={isProcessed}
            backButton={{
              show: true,
              onClickBackCallback: onClickBack,
            }}
            showPoweredByTilaka
          />
        </div>
      ) : (
        <div className="max-w- w-full" style={{ maxWidth: "331px" }}>
          <PinFormComponent
            key="pinFormKey"
            title={t("createPinTitle")}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
            submitFormCallback={submitFormCallback}
            isResetAfterSubmit
            isError={pinError.isError}
            isErrorMessage={pinError.message}
            isButtonNumberDisabled={isButtonNumberDisabled}
            isProcessed={isProcessed}
            subTitle={t("createPinSubtitle")}
            showPoweredByTilaka
          />
        </div>
      )}
    </div>
  );
};

export default PinFormDedicatedChannel;
