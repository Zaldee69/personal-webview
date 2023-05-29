import Image from "next/legacy/image";
import React from "react";
import Head from "next/head";
import i18n from "i18";
import Footer from "@/components/Footer";
import { assetPrefix } from "next.config";
import Button from "./atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import Heading from "./atoms/Heading";
import Paragraph from "./atoms/Paraghraph";

interface Props {
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
}

const Guide = ({ setIsClicked, isDisabled }: Props) => {
  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return (
    <div
      className="min-h-screen"
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
        <Heading>Liveness</Heading>
        <Paragraph size="sm" className="mt-4">
          {t("guideTitle")}
        </Paragraph>
        <div className="flex flex-col gap-5 my-6">
          <div className="grid poppins-regular gap-2 text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_guide_1 as string,
                "ASSET",
                `${assetPrefix}/images/1.svg`
              )}
              width={120}
              height={90}
            />
            <Paragraph size="sm">{t("guideSubtitle1")}</Paragraph>
          </div>
          <div className="grid poppins-regular gap-2 text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_guide_2 as string,
                "ASSET",
                `${assetPrefix}/images/2.svg`
              )}
              width={120}
              height={90}
            />
            <Paragraph size="sm">{t("guideSubtitle2")}</Paragraph>
          </div>
          <div className="grid poppins-regular gap-2 text-sm grid-cols-2 items-center grid-flow-col">
            <Image
              alt="guide-1"
              src={themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_guide_3 as string,
                "ASSET",
                `${assetPrefix}/images/3.svg`
              )}
              width={120}
              height={90}
            />
            <Paragraph size="sm">{t("guideSubtitle3")}</Paragraph>
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
