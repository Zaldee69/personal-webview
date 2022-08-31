import PinFormComponent from "@/components/PinFormComponent";
import { RestPersonalResetPassword } from "infrastructure/rest/personal";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useState } from "react";

type Props = {};

const PinFormDedicatedChannel = (props: Props) => {
  const router = useRouter();
  const {
    random,
    token,
    redirect_url,
  }: NextParsedUrlQuery & {
    random?: "1";
    token?: string;
    redirect_url?: string;
  } = router.query;
  const isRandom: boolean = random === "1";
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
  const [isRequestCheckStatus, setIsRequestCheckStatus] =
    useState<boolean>(false);

  const digitLength: number = 6;

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
  };
  const onClickCancel = (_: React.SyntheticEvent) => {
    const searchParams = new URLSearchParams(redirect_url + "?status=Cancel");
    // Redirect topmost window
    window.top!.location.href = decodeURIComponent(searchParams.toString());
  };
  const onClickBack = (_: React.SyntheticEvent) => {
    setPin("");
    setPinError({ isError: false, message: "" });
    setPinConfirmError({ isError: false, message: "" });
    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });
    setIsConfirmMode(false);
    setIsRequestCheckStatus(false);
  };
  const submitFormConfirmCallback = (pinConfirm: string) => {
    if (pin !== pinConfirm) {
      setPinConfirmErrorAfterSubmit({
        isError: true,
        message: "PIN tidak sesuai",
      });
      return;
    }

    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });

    const password = pin;

    RestPersonalResetPassword({
      payload: {
        password,
        token: token as string,
      },
    })
      .then((res) => {
        if (res.success) {
          setIsConfirmMode(false);
          if (redirect_url) {
            window.top!.location.href = decodeURIComponent(redirect_url);
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

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isConfirmMode ? (
        <div className="w-full" style={{ maxWidth: "331px" }}>
          <PinFormComponent
            key="pinFormConfirmKey"
            title="Konfirmasi PIN Baru"
            subTitle="Pastikan Konfirmasi PIN sudah sesuai"
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
            cancelLink={{
              show: redirect_url ? true : false,
              title: "Batal Buat PIN Baru",
              onClickCancelCallback: onClickCancel,
            }}
            showPoweredByTilaka
            backButton={{
              show: true,
              onClickBackCallback: onClickBack,
            }}
          />
        </div>
      ) : (
        <div className="w-full" style={{ maxWidth: "331px" }}>
          <PinFormComponent
            key="pinFormKey"
            title="Buat PIN Baru"
            subTitle="Hindari angka yang mudah ditebak, seperti angka berulang atau berurutan"
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
            submitFormCallback={submitFormCallback}
            isResetAfterSubmit
            isError={pinError.isError}
            isErrorMessage={pinError.message}
            isButtonNumberDisabled={isRequestCheckStatus}
            cancelLink={{
              show: redirect_url ? true : false,
              title: "Batal Buat PIN Baru",
              onClickCancelCallback: onClickCancel,
            }}
            showPoweredByTilaka
          />
        </div>
      )}
    </div>
  );
};

export default PinFormDedicatedChannel;
