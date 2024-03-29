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
import { Trans } from "react-i18next";
import { useCountdown } from "@/hooks/useCountdown";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";

interface TQueryParams {
  status?: string | undefined | string[];
  reason_code: string | undefined | string[];
  request_id: string;
  register_id: string;
  redirect_url?: string | undefined | string[];
  lang?: string | undefined | string[];
}

interface Props {
  status: string | null;
}

const LivenessFailure = (props: Props) => {
  const { t }: any = i18n;
  const router = useRouter();
  const routerQuery = router.query;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const uuid =
    routerQuery.transaction_id ||
    routerQuery.request_id ||
    routerQuery.registration_id;

  const { reason_code, redirect_url, lang } = routerQuery;

  const params: TQueryParams = {
    request_id: uuid as string,
    register_id: uuid as string,
    reason_code,
    status: props.status as string,
  };

  if (lang) {
    params["lang"] = lang;
  }

  if (redirect_url && reason_code !== "3") {
    params.redirect_url = redirect_url;
  }

  const second = 5;

  const { timeLeft } = useCountdown(second);

  const message =
    reason_code === "1"
      ? t("ekycFailed.errorCode1")
      : reason_code === "2"
      ? t("ekycFailed.errorCode2")
      : reason_code === "3"
      ? t("ekycFailed.errorCode3")
      : t("livenessFailed3xSubtitle");
  const isRedirectToManualForm = reason_code === "1" || reason_code === "2";

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: redirect_url as string,
  });

  useEffect(() => {
    if (isRedirectToManualForm) {
      setTimeout(() => {
        router.push({
          pathname: handleRoute("manual-form"),
          query: { ...params },
        });
      }, 5000);
    } else if (redirect_url && reason_code === "3") {
      autoRedirect();
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
      <div className="px-5 pt-8 max-w-md md:w-4/5 mx-auto">
        <div className="flex flex-col gap-16 items-center justify-center">
          <Heading className="text-center">{t("ekycFailed.title")}</Heading>
          <div
            className="bg-contain w-48 h-48 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data
                  .asset_registration_status_failed as string,
                "ASSET",
                `${assetPrefix}/images/livenessFail.svg`
              )})`,
            }}
          ></div>
          <div className="flex flex-col items-center gap-10 ">
            <Paragraph className="text-center">
              {message}
              {isRedirectToManualForm && (
                <div className="block">
                  <Paragraph className="whitespace-pre-line">
                    <Trans
                      values={{
                        timeLeft: timeLeft <= 0 ? 0 : timeLeft,
                      }}
                      i18nKey="ekycFailed.subtitle"
                    ></Trans>
                  </Paragraph>
                </div>
              )}
            </Paragraph>
            {redirect_url && reason_code === "3" ? (
              <a href={generatedUrl}>
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
            ) : null}
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

  const serverSideRenderReturnConditionsResult =
    serverSideRenderReturnConditions({ context, checkStepResult });

  serverSideRenderReturnConditionsResult["props"] = {
    status: checkStepResult.res?.data?.status || null,
    reasonCode: checkStepResult.res?.data?.reason_code || null,
  };

  return serverSideRenderReturnConditionsResult;
};

export default LivenessFailure;
