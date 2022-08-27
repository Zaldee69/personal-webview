import PinFormComponent from "@/components/PinFormComponent";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { RestKycCheckStep } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import {
  RestPersonalChangePassword,
  RestPersonalRequestChangePassword,
} from "infrastructure/rest/personal";
import { TPersonalRequestChangePasswordResponseData } from "infrastructure/rest/personal/types";
import { GetServerSideProps } from "next";
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
  const [pinCounter, setPinCounter] = useState<number>(1);

  const defaultPIN = "111111";

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

    localStorage.setItem("pinCounter", "1");
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
  const wrongOldPinOperation = (
    res: TPersonalRequestChangePasswordResponseData | null
  ) => {
    setOldPinErrorAfterSubmit({
      isError: true,
      message: "PIN salah",
    });
    setPinCounter(pinCounter + 1);
    localStorage.setItem("pinCounter", pinCounter.toString());
    if (pinCounter >= 3) {
      const searchParams = new URLSearchParams(
        redirect_url +
          (res !== null && res?.data?.length
            ? `?user_identifier=${res?.data?.[2]}&request_id=${res?.data?.[1]}&status=${res?.data?.[0]}`
            : `?status=Blocked`)
      );
      // Redirect topmost window
      window.top!.location.href = decodeURIComponent(searchParams.toString());
      // Reset pinCounter
      localStorage.setItem("pinCounter", "1");
      setPinCounter(1);
    }
  };
  const submitFormOldPinCallback = (pinConfirm: string) => {
    RestPersonalRequestChangePassword({
      payload: { request_id: request_id as string, password: pinConfirm },
    })
      .then((res) => {
        if (res.success) {
          setIsNewPinMode(true);
        } else {
          wrongOldPinOperation(res);
        }
      })
      .catch((err) => {
        if (err.response?.data?.data?.errors?.[0]) {
          wrongOldPinOperation(null);
        } else {
          wrongOldPinOperation(null);
        }
      });
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
    const counter = localStorage.getItem("pinCounter");
    if (!counter) {
      localStorage.setItem("pinCounter", "1");
    } else {
      setPinCounter(parseInt(counter as string));
    }
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
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
  } = await RestKycCheckStep({
    payload: { registerId: uuid as string },
  })
    .then((res) => {
      return { res };
    })
    .catch((err) => {
      return { err };
    });

  return serverSideRenderReturnConditions({ context, checkStepResult });
};

export default ChangePinDedicatedChannel;
