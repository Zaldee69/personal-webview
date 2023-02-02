import Footer from "@/components/Footer";
import FRCamera from "@/components/FRCamera";
import InfoIcon from "@/public/icons/InfoIcon";
import { handleRoute } from "@/utils/handleRoute";
import i18n from "i18";
import Head from "next/head";
import { useState } from "react";

type IModalFR = {
  isShowModalFr: boolean;
  setShowModalFr: React.Dispatch<React.SetStateAction<boolean>>;
};

type IOtpModalConfrimation = {
  isShowOtpModalConfirmation: boolean;
  setIsShowOtpModalConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
};

const SetMfa = () => {
  const { t }: any = i18n;

  const [isShowModalFr, setShowModalFr] = useState<boolean>(false);
  const [isShowOtpModalConfirmation, setIsShowOtpModalConfirmation] =
    useState<boolean>(false);
  const [mfaMethod, setMfaMethod] = useState<"fr" | "otp">("otp");

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setMfaMethod(e.currentTarget.value as "fr" | "otp");
    console.log(mfaMethod);
  };

  const onClickHandler = () => {
    if (mfaMethod === "fr") {
      setShowModalFr(true);
    } else {
      setIsShowOtpModalConfirmation(true);
    }
  };

  return (
    <>
      <Head>
        <title>Setting MFA</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
    <div className="max-w-md mx-auto px-2 pt-8 sm:w-full md:w-4/5">
      <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
        <div className="pt-1">
          <InfoIcon />
        </div>
        <p className="text-xs poppins-regular text-blue500 ml-4">
          {i18n.language === "en" ? (
            t("choosetAutheticantionModeInformation")
          ) : (
            <>
              Untuk meningkatkan keamanan, diperlukan{" "}
              <em>Multi Factor Authentication</em> yang harus Anda gunakan saat
              melakukan aktivitas tandatangan digital ataupun aktivitas lainnya
              di tilaka.id. Silakan pilih metode MFA yang sesuai dengan
              kenyamanan Anda.
            </>
          )}
        </p>
      </div>
      <div className="mt-6">
        <label className="flex items-center">
          <input
            name="mfa_method"
            value="fr"
            onChange={handleFormOnChange}
            checked={mfaMethod === "fr"}
            type="radio"
            className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
          />
          <p className="text-md ml-2.5 poppins-regular text-_030326">
            Face Recognition
          </p>
        </label>
        <label className="flex items-center mt-3.5">
          <input
            name="mfa_method"
            value="otp"
            onChange={handleFormOnChange}
            checked={mfaMethod === "otp"}
            type="radio"
            className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
          />
          <p className="text-md ml-2.5 poppins-regular text-_030326">
            OTP via Email
          </p>
        </label>
        <label className="flex items-center mt-3.5">
          <input
            disabled
            name="mfa_method"
            value="mfa_method_otp_ponsel"
            type="radio"
            className="appearance-none w-4 h-4 ring-1 bg-neutral40 ring-neutral50 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
          />
          <p className="text-md ml-2.5 poppins-regular text-_030326">
            {t("autheticantionMode3")}{" "}
            <span className="text-sm text-white bg-neutral80 px-2 py-1 rounded">
              Belum Tersedia
            </span>
          </p>
        </label>
      </div>
      <div className="poppins-regular justify-center flex-col-reverse md:flex-row flex gap-3 md:justify-end mt-10">
        <button className="text-primary font-semibold">Batal</button>
        <button
          onClick={onClickHandler}
          className="bg-primary text-white w-fit mx-auto md:mx-0 px-4 py-2 rounded"
        >
          Ubah Metode Otentikasi
        </button>
      </div>
      <FRModal isShowModalFr={isShowModalFr} setShowModalFr={setShowModalFr} />
      <OtpModalConfirmation
        isShowOtpModalConfirmation={isShowOtpModalConfirmation}
        setIsShowOtpModalConfirmation={setIsShowOtpModalConfirmation}
      />
    </div>
    <Footer/>
    </>
  );
};

const FRModal = ({ isShowModalFr, setShowModalFr }: IModalFR) => {
  const { t }: any = i18n;

  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);

  const captureProcessor = () => {};

  return isShowModalFr ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full"
    >
      <div className="bg-white mt-20 max-w-sm pt-5 px-2 pb-3 rounded-xl w-full mx-5 ">
        <>
          <p className="poppins-regular block text-center font-semibold ">
            Konfirmasi Perubahan Metode Otentikasi
          </p>
          <FRCamera
            setModal={setShowModalFr}
            setIsFRSuccess={setIsFRSuccess}
            signingFailedRedirectTo={handleRoute("login/v2")}
            tokenIdentifier="token_v2"
            callbackCaptureProcessor={captureProcessor}
          />
          <button
            className="bg-primary btn text-white block mx-auto w-fit px-6 poppins-regular mb-5 mt-7 rounded-md h-10 font-medium hover:opacity-50"
            onClick={() => setShowModalFr(false)}
          >
            {t("cancel")}
          </button>
        </>
      </div>
    </div>
  ) : null;
};

const OtpModalConfirmation = ({
  setIsShowOtpModalConfirmation,
  isShowOtpModalConfirmation,
}: IOtpModalConfrimation) => {
  const { t }: any = i18n;
  return isShowOtpModalConfirmation ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className={`fixed z-50 flex items-center transition-all poppins-regular duration-1000 justify-center w-full left-0 top-0 h-full`}
    >
      <div className="bg-white max-w-sm px-2 pb-4 rounded-xl w-full mx-5">
        <div className="px-5 py-5 flex justify-start gap-5 items-start">
          <div>
            <p className="poppins-regular block text-center font-semibold ">
              Konfirmasi Perubahan Metode Otentikasi
            </p>
            <p className="mt-8 text-sm text-center">
              Apa Anda yakin mengubah metode otentikasi menjadi OTP via email?
            </p>
          </div>
        </div>
        <div className="poppins-regular justify-center flex-col-reverse  flex gap-3  mt-5">
          <button onClick={() => setIsShowOtpModalConfirmation(false)} className="text-primary font-semibold">Batal</button>
          <button
            //   onClick={onClickHandler}
            className="bg-primary text-white w-fit mx-auto px-4 py-2 rounded"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default SetMfa;
