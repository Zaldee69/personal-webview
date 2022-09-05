import PinFormComponent from "@/components/PinFormComponent";
import { RestSigningAuthPIN } from "infrastructure";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";

type Props = {};

const AuthPinForm = (props: Props) => {
  const router = useRouter();
  const {
    random,
    user,
    id,
    redirect_url,
  }: NextParsedUrlQuery & {
    random?: "1";
    user?: string;
    id?: string;
    redirect_url?: string;
  } = router.query;
  const isRandom: boolean = random === "1";
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<{
    isError: boolean;
    message: string;
  }>({ isError: false, message: "" });
  const [isRequestCheckStatus, setIsRequestCheckStatus] =
    useState<boolean>(false);

  const digitLength: number = 6;

  const onClickNumberHandlerCallback = (value: number) => {};
  const onClickDeleteHandlerCallback = () => {
    setPinError({ isError: false, message: "" });
  };
  const submitFormCallback = (pin: string) => {
    setPin(pin);
    RestSigningAuthPIN({
      payload: {
        user: user || "",
        pin,
        id: id || "",
      },
    })
      .then((res) => {
        if (res.success) {
          setPinError({
            isError: false,
            message: res?.message || "penandatanganan dokumen berhasil",
          });
          setIsRequestCheckStatus(false);
          if (redirect_url) {
            const searchParams = new URLSearchParams(
              `${redirect_url}?user_identifier=${user}&signing_id=${id}&status=Sukses`
            );
            window.top!.location.href = decodeURIComponent(
              searchParams.toString()
            );
          }
        } else {
          setPinError({
            isError: true,
            message: res?.message || "proses gagal",
          });
          if (
            res?.message ===
              "penandatanganan dokumen gagal. pin sudah salah 3 kali" &&
            redirect_url
          ) {
            const searchParams = new URLSearchParams(
              `${redirect_url}?user_identifier=${user}&signing_id=${id}&status=Blocked`
            );
            setTimeout(() => {
              window.top!.location.href = decodeURIComponent(
                searchParams.toString()
              );
            }, 2000);
          }
        }
      })
      .catch((err) => {
        if (err.response?.data?.data?.errors?.[0]) {
          setPinError({
            isError: true,
            message: `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
          });
        } else {
          setPinError({
            isError: true,
            message: err.response?.data?.message || "proses gagal",
          });
        }
      });
  };

  useEffect(() => {
    if (!router.isReady) return;
    setShouldRender(true);
    if (!user || !id) {
      setPinError({
        isError: true,
        message: "user atau id dibutuhkan",
      });
      setIsRequestCheckStatus(true);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w- w-full" style={{ maxWidth: "331px" }}>
        <PinFormComponent
          key="pinFormKey"
          title={"PIN"}
          subTitle={`Masukkan ${digitLength}-digit PIN untuk konfirmasi tanda tangan`}
          digitLength={digitLength}
          isRandom={isRandom}
          onClickNumberHandlerCallback={onClickNumberHandlerCallback}
          onClickDeleteHandlerCallback={onClickDeleteHandlerCallback}
          submitFormCallback={submitFormCallback}
          isResetAfterSubmit
          isErrorAfterSubmit={pinError.isError}
          isErrorAfterSubmitMessage={pinError.message}
          isButtonNumberDisabled={isRequestCheckStatus}
          showPoweredByTilaka
        />
      </div>
    </div>
  );
};

export default AuthPinForm;
