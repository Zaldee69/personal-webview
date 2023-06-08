import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Footer from "../../components/Footer";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { handleRoute } from "@/utils/handleRoute";
import { buttonVariants } from "@/components/atoms/Button";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
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
    status: "F",
    register_id: uuid,
  };
  const queryString = new URLSearchParams(params as any).toString();
  const reason_code = routerQuery.reason_code;
  const message =
    reason_code === "1"
      ? t("ekycFailed.errorCode1")
      : reason_code === "2"
      ? t("ekycFailed.errorCode2")
      : reason_code === "3"
      ? t("ekycFailed.errorCode3")
      : t("livenessFailed3xSubtitle");
  const isRedirectToManualForm = reason_code === "1" || reason_code === "2";
  useEffect(() => {
    if (isRedirectToManualForm) {
      setTimeout(() => {
        router.push({
          pathname: handleRoute("manual-form"),
          query: routerQuery,
        });
      }, 5000);
    }
  }, []);
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
          <Heading className="text-center">
            {t("ekycFailed.title")} Banget gasiiii
          </Heading>
          <div
            className="bg-contain w-48 h-48 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_registration_status_failed as string,
                "ASSET",
                `${assetPrefix}/images/livenessFail.svg`
              )})`,
            }}
          ></div>
          <div className="flex flex-col items-center gap-10 ">
            <Paragraph size="sm" className="text-center">
              {message}
              {isRedirectToManualForm && (
                <div>
                  <div className="hidden lg:block">
                    <Paragraph  className="text-center">
                      {t("ekycFailed.subtitle1")} <br />
                      {t("ekycFailed.subtitle2")}
                    </Paragraph>
                  </div>
                  <div className="block lg:hidden">
                    <Paragraph className="text-center text-red-100">
                      {t("ekycFailed.subtitle")}
                    </Paragraph>
                  </div>
                </div>
              )}
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
  } = await RestKycCheckStepv2({
    registerId: uuid as string,
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
