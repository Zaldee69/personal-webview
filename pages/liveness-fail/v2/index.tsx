import Head from "next/head";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "../../../components/Footer";
import i18n from "i18";
import { useRouter } from "next/router";
import { assetPrefix } from "../../../next.config";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { setIsDone } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { RestKycCheckStep } from "infrastructure";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

const LivenessFail = () => {
  const router = useRouter();
  const [gagalCounter, setGagalCounter] = useState(0);
  const dispatch: AppDispatch = useDispatch();

  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const resetStorage = () => {
    setGagalCounter(0);
    sessionStorage.removeItem("tlk-counter1");
    if (router.query.redirect_url) {
      window.location.replace(
        concateRedirectUrlParams(router.query.redirect_url as string, "")
      );
    } else {
      router.replace({
        pathname: handleRoute("/"),
      });
    }
  };

  useEffect(() => {
    if (gagalCounter > 2) localStorage.removeItem("tlk-counter1");
  }, [gagalCounter]);

  useEffect(() => {
    dispatch(setIsDone(false));
    if (localStorage.getItem("tlk-counter1")) {
      setGagalCounter(parseInt(localStorage.getItem("tlk-counter1") as string));
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
        <Link
          passHref
          href={{
            pathname: handleRoute("liveness/v2"),
            query: { ...router.query },
          }}
        >
          <Button
            size="md"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
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
    <div className="min-h-screen" style={{
      backgroundColor: themeConfigurationAvaliabilityChecker(
        themeConfiguration?.data.background as string, "BG"
      ),
    }} >
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-sm sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-10 items-center justify-center">
          <Heading>
            {t("livenessFailedTitle")}
          </Heading>
          <div
            className="bg-contain w-52 h-52 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_v2_failed as string,
                "ASSET",
                `${assetPrefix}/images/livenessFail.svg`
              )})`,
            }}
          ></div>
          <div className="flex flex-col gap-10 ">
            <Paragraph className="text-center">
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

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const cQuery = context.query;
//   const uuid =
//     cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;

//   const checkStepResult: {
//     res?: TKycCheckStepResponseData;
//     err?: {
//       response: {
//         data: {
//           success: boolean;
//           message: string;
//           data: { errors: string[] };
//         };
//       };
//     };
//   } = await RestKycCheckStep({
//     payload: { registerId: uuid as string },
//   })
//     .then((res) => {
//       return { res };
//     })
//     .catch((err) => {
//       return { err };
//     });

//   return serverSideRenderReturnConditions({ context, checkStepResult });
// };

export default LivenessFail;
