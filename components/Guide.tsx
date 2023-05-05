import Image from "next/image";
import React from "react";
import Head from "next/head";
import i18n from "i18";
import Footer from "@/components/Footer";
import { assetPrefix } from "next.config";
import Button from "./atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";

interface Props {
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
}

const Guide = ({ setIsClicked, isDisabled }: Props) => {
  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
    >
      <Head>
        <title>Panduan Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className=" py-10 max-w-sm mx-auto px-2 pt-8 sm:w-full md:w-4/5 ">
        <h2 className="poppins-regular text-xl font-semibold">Liveness</h2>
        <span className="poppins-regular text-sm block mt-4">
          {t("guideTitle")}
        </span>
        <div className="flex flex-col gap-5 my-6">
          <div className="grid poppins-regular text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={`${assetPrefix}/images/1.svg`}
              width={120}
              height={90}
            />
            <p>{t("guideSubtitle1")}</p>
          </div>
          <div className="grid poppins-regular text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={`${assetPrefix}/images/2.svg`}
              width={120}
              height={90}
            />
            <p>{t("guideSubtitle2")}</p>
          </div>
          <div className="grid poppins-regular text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={`${assetPrefix}/images/3.svg`}
              width={120}
              height={90}
            />
            <p>{t("guideSubtitle3")}</p>
          </div>
        </div>
        <Button
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.buttonColor as string
            ),
          }}
          disabled={isDisabled}
          onClick={() => setIsClicked(true)}
          size="sm"
        >
          {t("startButton")}
        </Button>
        <Footer />
      </div>
    </div>
  );
};

export default Guide;
