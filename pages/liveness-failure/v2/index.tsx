import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { handleRoute } from "@/utils/handleRoute";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { RestKycCheckStep } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Footer from "../../../components/Footer";
import { assetPrefix } from "../../../next.config";
import i18n from "i18";
import { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

const LivenessFailure = () => {
  const { t }: any = i18n;
  const router = useRouter();
  const routerQuery = router.query;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const uuid =
    routerQuery.transaction_id ||
    routerQuery.request_id ||
    routerQuery.registration_id;
  const params = {
    status: "False",
    uuid,
    register_id: uuid
  };

  const queryString = new URLSearchParams(params as any).toString();

  useEffect(() => {
    if (routerQuery.redirect_url) {
      setTimeout(() => {
        router.push({
          pathname: routerQuery.redirect_url as string,
          query: queryString,
        });
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

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
      <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-16 items-center justify-center">
          <Heading className="text-center">{t("livenessFailedTitle")}</Heading>
          <div
            className="bg-contain w-48 h-48 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_liveness_v2_failed as string,
                "ASSET",
                `${assetPrefix}/images/livenessFail.svg`
              )})`,
            }}
          ></div>
          <div className="flex flex-col items-center gap-10 ">
            <Paragraph size="sm" className="text-center">
              {t("livenessV2FailureTitle")}
            </Paragraph>
            {routerQuery.redirect_url && (
              <a
                href={concateRedirectUrlParams(
                  routerQuery.redirect_url as string,
                  queryString
                )}
              >
                <span
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({
                    variant: "link",
                    size: "none",
                    className: "font-semibold",
                  })}
                >
                  {t("livenessSuccessButtonTitle")}
                </span>
              </a>
            )}
          </div>
        </div>
        <Footer />
      </div>
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

export default LivenessFailure;
