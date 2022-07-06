import PinFormComponent from "@/components/PinFormComponent";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const PinFormDedicatedChannel = (props: Props) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & { random?: "1" } = router.query;
  const isRandom: boolean = routerQuery.random === "1";
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinConfirmError, setPinConfirmError] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [isConfirmMode, setIsConfirmMode] = useState<boolean>(false);

  const digitLength: number = 6;

  const onClickNumberHandlerCallback = (value: number) => {};
  const onClickDeleteHandlerCallback = () => {};
  const submitFormCallback = (pin: string) => {
    setPin(pin);
    setIsConfirmMode(true);
  };
  const onClickNumberHandlerConfirmCallback = (value: number) => {};
  const onClickDeleteHandlerConfirmCallback = () => {};
  const submitFormConfirmCallback = (pinConfirm: string) => {
    if (pin !== pinConfirm) {
      setPinConfirmError({ isError: true, message: "PIN does not match" });
      return;
    }
    setPinConfirmError({ isError: false, message: "" });
    // setIsConfirmMode(false);

    // hit api with pin or pinConfirm
    alert("cocok, hit api dengan pin: " + pin);
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
  }, [router.isReady]);

  if (!shouldRender) return;

  return (
    <div className="flex justify-center items-center min-h-screen">
      {isConfirmMode ? (
        <div className="max-w-xs w-full">
          <PinFormComponent
            key="pinFormConfirmKey"
            title={`Confirm PIN`}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerConfirmCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerConfirmCallback}
            submitFormCallback={submitFormConfirmCallback}
            isResetAfterSubmit={false}
            isErrorAfterSubmit={pinConfirmError.isError}
            isErrorAfterSubmitMessage={pinConfirmError.message}
          />
        </div>
      ) : (
        <div className="max-w-xs w-full">
          <PinFormComponent
            key="pinFormKey"
            title={`Set ${digitLength}-digit PIN`}
            digitLength={digitLength}
            isRandom={isRandom}
            onClickNumberHandlerCallback={onClickNumberHandlerCallback}
            onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
            submitFormCallback={submitFormCallback}
            isResetAfterSubmit
          />
        </div>
      )}
    </div>
  );
};

export default PinFormDedicatedChannel;
