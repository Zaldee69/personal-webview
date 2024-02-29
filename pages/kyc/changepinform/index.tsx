import PinFormComponent from "@/components/PinFormComponent";
import i18n from "i18";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import {
  RestPersonalChangePassword,
  RestPersonalRequestChangePassword,
} from "infrastructure/rest/personal";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

type Props = {};

const ChangePinDedicatedChannel = (props: Props) => {
  const router = useRouter();
  const { t }: any = i18n;
  const {
    random,
    request_id,
    redirect_url,
  }: NextParsedUrlQuery & {
    random?: "1";
    request_id?: string;
    redirect_url?: string;
  } = router.query;
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
  const [oldPinErrorAfterSubmit, setOldPinErrorAfterSubmit] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [isConfirmMode, setIsConfirmMode] = useState<boolean>(false);
  const [isNewPinMode, setIsNewPinMode] = useState<boolean>(false);

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
    setPinConfirmError({ isError: false, message: "" });
    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });
  };
  const onClickNumberHandlerOldPinCallback = (value: number) => {
    setOldPinErrorAfterSubmit({ isError: false, message: "" });
  };
  const onClickDeleteHandlerOldPinCallback = () => {
    setOldPinErrorAfterSubmit({ isError: false, message: "" });
  };
  const onClickBack = () => {
    setPin("");
    setPinError({ isError: false, message: "" });
    setPinConfirmError({ isError: false, message: "" });
    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });
    setIsConfirmMode(false);
  };
  const onClickCancel = (_: React.SyntheticEvent) => {
    const params = {
      status: "Cancel",
    };
    const queryString = new URLSearchParams(params as any).toString();
    window.top!.location.href = concateRedirectUrlParams(
      redirect_url as string,
      queryString
    );
  };
  const submitFormConfirmCallback = (pinConfirm: string) => {
    if (pin !== pinConfirm) {
      setPinConfirmErrorAfterSubmit({
        isError: true,
        message: t("confirmPinDoesntMatch"),
      });
      return;
    }

    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });

    const password = pin;

    RestPersonalChangePassword({
      payload: {
        request_id: request_id as string,
        password,
      },
    })
      .then((res) => {
        if (res.success) {
          setIsConfirmMode(false);
          if (redirect_url) {
            const params = {
              user_identifier: res?.data?.[2],
              request_id: res?.data?.[1],
              status: res?.data?.[0],
            };
            const queryString = new URLSearchParams(params as any).toString();
            window.top!.location.href = concateRedirectUrlParams(
              redirect_url as string,
              queryString
            );
          }
        } else {
          setPinConfirmError({
            isError: true,
            message: res?.message || "gagal",
          });
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
      });
  };
  const submitFormOldPinCallback = (pinConfirm: string) => {
    RestPersonalRequestChangePassword({
      payload: { request_id: request_id as string, password: pinConfirm },
    })
      .then((res) => {
        if (res.success) {
          setIsNewPinMode(true);
        } else {
          // if res.message contains the word "password", then we consider a pin error
          if (res.message.toLowerCase().includes("password")) {
            setOldPinErrorAfterSubmit({
              isError: true,
              message: t("authPinError1"),
            });
          } else {
            setOldPinErrorAfterSubmit({
              isError: true,
              message: res.message || "tidak berhasil",
            });
          }
          if (res?.data !== null && redirect_url) {
            const params = {
              user_identifier: res?.data?.[2],
              request_id: res?.data?.[1],
              status: res?.data?.[0],
            };
            const queryString = new URLSearchParams(params as any).toString();
            window.top!.location.href = concateRedirectUrlParams(
              redirect_url as string,
              queryString
            );
          }
        }
      })
      .catch((err) => {
        if (err.response?.data?.data?.errors?.[0]) {
          setOldPinErrorAfterSubmit({
            isError: true,
            message: err.response?.data?.data?.errors?.[0] || "ada yang salah",
          });
        } else {
          setOldPinErrorAfterSubmit({
            isError: true,
            message: err.response?.data?.message || "ada yang salah",
          });
        }
      });
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
  }, [router.isReady]);

  if (!shouldRender) return;

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
      {!isNewPinMode ? (
        <div className="max-w-xs w-full">
          <PinFormComponent
            key="pinFormKey"
            title={t("oldPinTitle")}
            subTitle={t("oldPinSubttitle")}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerOldPinCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerOldPinCallback}
            submitFormCallback={submitFormOldPinCallback}
            isResetAfterSubmit={true}
            isErrorAfterSubmit={oldPinErrorAfterSubmit.isError}
            isErrorAfterSubmitMessage={oldPinErrorAfterSubmit.message}
            showPoweredByTilaka
          />
        </div>
      ) : (
        <div className="max-w-xs w-full">
          {isConfirmMode ? (
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
              showPoweredByTilaka
              backButton={{
                show: true,
                onClickBackCallback: onClickBack,
              }}
              cancelLink={{
                show: redirect_url ? true : false,
                title: t("cancelCreateNewPin"),
                onClickCancelCallback: onClickCancel,
              }}
            />
          ) : (
            <PinFormComponent
              key="pinFormKey"
              title={t("newPinTitle")}
              subTitle={t("newPinSubtitle")}
              digitLength={digitLength}
              isRandom={isRandom}
              onClickNumberHandlerCallback={onClickNumberHandlerCallback}
              onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
              submitFormCallback={submitFormCallback}
              isResetAfterSubmit={true}
              isError={pinError.isError}
              isErrorMessage={pinError.message}
              cancelLink={{
                show: redirect_url ? true : false,
                title: t("cancelCreateNewPin"),
                onClickCancelCallback: onClickCancel,
              }}
              showPoweredByTilaka
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChangePinDedicatedChannel;
