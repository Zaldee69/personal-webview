import PinFormComponent from "@/components/PinFormComponent";
import {
  RestPersonalChangePassword,
  RestPersonalRequestChangePassword,
} from "infrastructure/rest/personal";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const ChangePinDedicatedChannel = (props: Props) => {
  const router = useRouter();
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
    const searchParams = new URLSearchParams(redirect_url + "?status=Cancel");
    // Redirect topmost window
    window.top!.location.href = decodeURIComponent(searchParams.toString());
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
              message: "PIN salah",
            });
          } else {
            setOldPinErrorAfterSubmit({
              isError: true,
              message: res.message || "tidak berhasil",
            });
          }
          if (res?.data !== null && redirect_url) {
            const searchParams = new URLSearchParams(
              redirect_url +
                `?user_identifier=${res?.data?.[2]}&request_id=${res?.data?.[1]}&status=${res?.data?.[0]}`
            );
            window.top!.location.href = decodeURIComponent(
              searchParams.toString()
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
    <div className="flex justify-center items-center min-h-screen">
      {!isNewPinMode ? (
        <div className="max-w-xs w-full">
          <PinFormComponent
            key="pinFormKey"
            title={`PIN Lama`}
            subTitle={`Demi keamanan, masukkan PIN lama yang masih digunakan`}
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
              title={`Konfirmasi PIN Baru`}
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
              showPoweredByTilaka
              backButton={{
                show: true,
                onClickBackCallback: onClickBack,
              }}
              cancelLink={{
                show: redirect_url ? true : false,
                title: "Batal Buat PIN Baru",
                onClickCancelCallback: onClickCancel,
              }}
            />
          ) : (
            <PinFormComponent
              key="pinFormKey"
              title={`Buat PIN Baru`}
              subTitle={`Hindari angka yang mudah ditebak, seperti angka berulang atau berurutan`}
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
                title: "Batal Buat PIN Baru",
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
