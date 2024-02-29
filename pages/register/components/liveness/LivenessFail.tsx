import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import i18n from "i18";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { setIsDone } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import Button from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import { assetPrefix } from "next.config";

const LivenessFail = () => {
  const router = useRouter();
  const [gagalCounter, setGagalCounter] = useState(0);
  const dispatch: AppDispatch = useDispatch();

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  const uuid =
    router.query.transaction_id ||
    router.query.request_id ||
    router.query.registration_id;
  const params = {
    status: "F",
    request_id: uuid,
  };
  const queryString = new URLSearchParams(params as any).toString();

  const resetStorage = () => {
    setGagalCounter(0);
    sessionStorage.removeItem("tlk-counter");
    if (router.query.redirect_url) {
      window.location.replace(
        concateRedirectUrlParams(
          router.query.redirect_url as string,
          queryString
        )
      );
    } else {
      router.replace({
        pathname: handleRoute("/"),
      });
    }
  };

  const getUrlWithoutStepParams = () => {
    let url = new URL(location.href);
    url.searchParams.delete("step");
    return url;
  };

  useEffect(() => {
    if (gagalCounter > 2) localStorage.removeItem("tlk-counter");
  }, [gagalCounter]);

  useEffect(() => {
    dispatch(setIsDone(false));
    if (localStorage.getItem("tlk-counter")) {
      setGagalCounter(parseInt(localStorage.getItem("tlk-counter") as string));
    }
  }, []);

  const RedirectButton = () => {
    if (gagalCounter > 2) {
      return (
        <span
          onClick={resetStorage}
          className="cursor-pointer text-center poppins-semibold underline-offset-1	underline  text-primary"
        >
          {t("livenessSuccessButtonTitle")}
        </span>
      );
    } else {
      return (
        <Link passHref href={getUrlWithoutStepParams()}>
          <Button
            size="md"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
          >
            {t("livenessFailedButtonTitle")}
          </Button>
        </Link>
      );
    }
  };
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
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-sm mx-auto">
        <div className="flex flex-col gap-16 items-center justify-center">
          <Heading className="text-center">{t("livenessFailedTitle")}</Heading>
          <div
            className="bg-contain w-48 h-48 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_failed as string,
                "ASSET",
                `${assetPrefix}/images/livenessFail.svg`
              )})`,
            }}
          ></div>
          <div className="flex flex-col gap-10 ">
            <Paragraph size="sm" className="text-center">
              {gagalCounter > 2
                ? t("livenessFailed3xSubtitle")
                : t("livenessFailedSubtitle")}
            </Paragraph>
          </div>
          <RedirectButton />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LivenessFail;
