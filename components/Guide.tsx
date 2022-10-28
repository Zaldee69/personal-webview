import Image from "next/image";
import React from "react";
import Head from "next/head";
import i18n from "i18";
import Footer from "@/components/Footer";

interface Props {
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean
}

const Guide = ({setIsClicked, isDisabled}: Props) => {
  const { t }: any = i18n;

  return (
    <>
      <Head>
        <title>Panduan Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className=" py-10 max-w-sm mx-auto px-2 pt-8 sm:w-full md:w-4/5 ">
        <h2 className="font-poppins text-xl font-semibold">Liveness</h2>
        <span className="font-poppins text-sm block mt-4">
          {t("guideTitle")}
        </span>
        <div className="flex flex-row justify-center mt-10 gap-5">
          <div className="flex flex-col items-center space-y-4">
            <Image
              alt="guide-1"
              src="/images/Liveness.svg"
              width={150}
              height={120}
            />
            <Image
              alt="right-guide"
              src="/images/Right.svg"
              width={30}
              height={30}
            />
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Image
              alt="guide-2"
              src="/images/guide1.svg"
              width={150}
              height={120}
            />
            <Image
              alt="wrong-guide"
              src="/images/Wrong.svg"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div>
          <ul className="list-disc flex flex-col font-poppins text-sm gap-4 my-10 px-5">
            <li>{t("guideSubtitle1")}</li>
            <li>{t("guideSubtitle2")}</li>
            <li>{t("guideSubtitle3")}</li>
          </ul>
        </div>
        <button disabled={isDisabled} onClick={() => setIsClicked(true)} className="bg-primary disabled:opacity-75 btn md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-9 ">
          {t("startButton")}
        </button>
        <Footer />
      </div>
    </>
  );
};

export default Guide;
