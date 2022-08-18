import PinFormComponent from "@/components/PinFormComponent";
import { RestKycCheckStep, RestKycFinalForm } from "infrastructure";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const PinFormDedicatedChannel = (props: Props) => {
  const router = useRouter();
  const {
    random,
    user_identifier,
    registration_id,
    redirect_url,
  }: NextParsedUrlQuery & {
    random?: "1";
    user_identifier?: string;
    registration_id?: string;
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
  const submitFormConfirmCallback = (pinConfirm: string) => {
    if (pin !== pinConfirm) {
      setPinConfirmErrorAfterSubmit({
        isError: true,
        message: "PIN does not match",
      });
      return;
    }

    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });

    const tilakaName = user_identifier || "";
    const password = pin;

    RestKycFinalForm({
      payload: {
        tilakaName,
        password,
        registerId: registration_id as string,
      },
    })
      .then((res) => {
        if (res.success) {
          setIsConfirmMode(false);
          if (redirect_url) {
            const searchParams = new URLSearchParams(
              redirect_url + "?register_id=" + registration_id
            );
            // Set params
            res.data.status && searchParams.set("status", `${res.data.status}`);
            // Redirect topmost window
            window.top!.location.href = decodeURIComponent(
              searchParams.toString()
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

  const onClickBack = (_: React.SyntheticEvent) => {
    setPin("");
    setPinError({ isError: false, message: "" });
    setPinConfirmError({ isError: false, message: "" });
    setPinConfirmErrorAfterSubmit({ isError: false, message: "" });
    setIsConfirmMode(false);
    setIsRequestCheckStatus(false);
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
    setIsRequestCheckStatus(true);
    RestKycCheckStep({
      payload: { registerId: registration_id as string },
    })
      .then((res) => {
        if (res.success) {
          setPinError({ isError: false, message: "pengecekan step berhasil" });
          setIsRequestCheckStatus(false);
        } else {
          setPinError({
            isError: true,
            message: res?.message || "pengecekan step tidak sukses",
          });
          setIsRequestCheckStatus(true);
        }
      })
      .catch((err) => {
        if (err.response?.data?.data?.errors?.[0]) {
          setPinError({
            isError: true,
            message: err.response?.data?.data?.errors?.[0],
          });
          setIsRequestCheckStatus(true);
        } else {
          setPinError({
            isError: true,
            message: err.response?.data?.message || "pengecekan step gagal",
          });
          setIsRequestCheckStatus(true);
        }
      });
  }, [router.isReady, registration_id]);

  if (!shouldRender) return;

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isConfirmMode ? (
        <div className="max-w- w-full" style={{ maxWidth: "331px" }}>
          <PinFormComponent
            key="pinFormConfirmKey"
            title={`Konfirmasi PIN`}
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
            title={`Buat PIN`}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
            submitFormCallback={submitFormCallback}
            isResetAfterSubmit
            isError={pinError.isError}
            isErrorMessage={pinError.message}
            isButtonNumberDisabled={isRequestCheckStatus}
            subTitle="Buat 6-digit PIN untuk menggunakan layanan Tanda Tangan Digital dengan aman"
            showPoweredByTilaka
          />
        </div>
      )}
    </div>
  );
};

export default PinFormDedicatedChannel;
