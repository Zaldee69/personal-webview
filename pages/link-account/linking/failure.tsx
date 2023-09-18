import { handleRoute } from "@/utils/handleRoute";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { assetPrefix } from "../../../next.config";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import {
  getFRFailedCount,
  resetFRFailedCount,
} from "@/utils/frFailedCountGetterSetter";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { buttonVariants } from "@/components/atoms/Button";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import { useCountdown } from "@/hooks/useCountdown";
import { Trans } from "react-i18next";

type Props = {
  checkStepResultDataRoute: TKycCheckStepResponseData["data"]["route"];
  checkStepResultResponseData: string[];
};

const LinkAccountFailure = (props: Props) => {
  const router = useRouter();
  const { t }: any = i18n;
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    tilaka_name?: string;
    reject_by_user?: "1";
    account_locked?: "1";
  } = router.query;
  const [redirectUrl, setRedirectUrl] = useState<string>(
    routerQuery.redirect_url as string
  );

  const second = 5;

  const { timeLeft } = useCountdown(second);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const failedCount = getFRFailedCount("count");

  useEffect(() => {
    if (!routerIsReady) return;

    if (router.query.next_path === "manual_form") {
      setTimeout(() => {
        router.push({
          pathname: handleRoute("manual-form"),
          query: {
            ...routerQuery,
          },
        });
        resetFRFailedCount("count");
      }, 5000);
    } else {
      let queryWithDynamicRedirectURL = {
        ...routerQuery,
      };
      let params: any = {};

      if (queryWithDynamicRedirectURL.request_id) {
        params["request-id"] = queryWithDynamicRedirectURL.request_id;
      }
      if (queryWithDynamicRedirectURL.tilaka_name) {
        params["tilaka-name"] = queryWithDynamicRedirectURL.tilaka_name;
      }
      if (queryWithDynamicRedirectURL.status) {
        params["status"] = queryWithDynamicRedirectURL.status;
      }
      if (queryWithDynamicRedirectURL.reason) {
        params["reason"] = queryWithDynamicRedirectURL.reason;
      }

      let queryString = new URLSearchParams(params as any).toString();

      if (queryWithDynamicRedirectURL.redirect_url?.length) {
        const currentRedirectUrl =
          queryWithDynamicRedirectURL.redirect_url as string;
        const currentRedirectUrlArr = currentRedirectUrl.split("?");

        if (currentRedirectUrlArr.length > 1) {
          if (
            currentRedirectUrlArr[1].includes("request-id") &&
            currentRedirectUrlArr[1].includes("tilaka-name")
          ) {
            queryWithDynamicRedirectURL.redirect_url =
              currentRedirectUrlArr[0] + "?" + currentRedirectUrlArr[1] + "&";
          } else if (currentRedirectUrlArr[1].includes("request-id")) {
            const additionParams = {
              ...params,
              "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
            };
            queryString = new URLSearchParams(additionParams as any).toString();

            queryWithDynamicRedirectURL.redirect_url =
              currentRedirectUrlArr[0] +
              "?" +
              currentRedirectUrlArr[1] +
              "&" +
              queryString;
          } else if (currentRedirectUrlArr[1].includes("tilaka-name")) {
            const additionParams = {
              ...params,
              "request-id": queryWithDynamicRedirectURL.request_id,
            };
            queryString = new URLSearchParams(additionParams as any).toString();

            queryWithDynamicRedirectURL.redirect_url =
              currentRedirectUrlArr[0] +
              "?" +
              currentRedirectUrlArr[1] +
              "&" +
              queryString;
          } else {
            // manualy input redirect_url on url
            queryWithDynamicRedirectURL.redirect_url =
              currentRedirectUrlArr[0] +
              "?" +
              currentRedirectUrlArr[1] +
              "&" +
              queryString;
          }
        } else {
          // current redirect_url no has param
          queryWithDynamicRedirectURL.redirect_url =
            currentRedirectUrlArr[0] + "?" + queryString;
        }
      }

      setRedirectUrl(queryWithDynamicRedirectURL.redirect_url as string);
    }
  }, [routerIsReady, routerQuery]);

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
      <div className="px-10 max-w-md mx-auto pt-16 pb-9 text-center">
        <Heading>{t("linkAccountFailedTitle")}</Heading>
        <div
          className="bg-contain mt-10 w-52 mx-auto h-64 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_activation_failed as string,
              "ASSET",
              `${assetPrefix}/images/linkAccountFailure.svg`
            )})`,
          }}
        ></div>
        {failedCount >= 5 && (
          <>
            <Heading className="text-base my-5">
              {t("linkAccountFailed5x.title")}
            </Heading>
            <Paragraph className="whitespace-pre-line" >
              <Trans
                values={{
                  timeLeft: timeLeft <= 0 ? 0 : timeLeft,
                }}
                i18nKey="linkAccountFailed5x.subtitle1"
              ></Trans>
            </Paragraph>
          </>
        )}
        {props.checkStepResultDataRoute === "manual_form" &&
          failedCount === 0 && (
            <>
              <Heading className="text-base my-5">
                {t("linkAccountFailed5x.title")}
              </Heading>
              <Paragraph className="whitespace-pre-line" >
                <Trans
                  values={{
                    timeLeft: timeLeft <= 0 ? 0 : timeLeft,
                  }}
                  i18nKey="linkAccountFailed5x.subtitle1"
                ></Trans>
              </Paragraph>
            </>
          )}
        {props.checkStepResultDataRoute === "penautan_consent" ? (
          routerQuery.reject_by_user === "1" ? (
            <div className="mt-14">
              <Paragraph size="sm">
                {t("consentLinkAccountFailedSubtitleRejectByUser")}
              </Paragraph>
            </div>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {props.checkStepResultDataRoute === "penautan_consent" ? (
          routerQuery.account_locked === "1" ? (
            <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
              <Link
                href={{
                  pathname: handleRoute("link-account"),
                  query: { ...router.query },
                }}
              >
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({
                    variant: "link",
                    size: "none",
                    className: "font-medium",
                  })}
                >
                  {t("linkAccountTilaka")}
                </a>
              </Link>
            </div>
          ) : (
            redirectUrl && (
              <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
                <a
                  style={{
                    color: themeConfigurationAvaliabilityChecker(
                      themeConfiguration?.data.action_font_color as string
                    ),
                  }}
                  className={buttonVariants({
                    variant: "link",
                    size: "none",
                    className: "font-medium",
                  })}
                  href={concateRedirectUrlParams(redirectUrl, "")}
                >
                  {t("livenessSuccessButtonTitle")}
                </a>
              </div>
            )
          )
        ) : null}
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
    ...serverSideRenderReturnConditionsResult["props"],
    checkStepResultDataRoute: checkStepResult.res?.data?.route || null,
    checkStepResultResponseData: checkStepResult.res?.data.errors || null,
  };

  return serverSideRenderReturnConditionsResult;
};

export default LinkAccountFailure;
