import { handleRoute } from "@/utils/handleRoute";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { assetPrefix } from "../../next.config";
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
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";

type Props = {
  checkStepResultDataRoute: TKycCheckStepResponseData["data"]["route"];
  checkStepResultResponseData: string[];
};

const LinkAccountFailure = (props: Props) => {
  const router = useRouter();
  const { t }: any = i18n;
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    setting?: "1";
    redirect_url?: string;
    tilaka_name?: string;
    reject_by_user?: "1";
    account_locked?: "1";
  } = router.query;
  const [redirectUrl, setRedirectUrl] = useState<string>(
    routerQuery.redirect_url as string
  );

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const failedCount = getFRFailedCount("count");

  useEffect(() => {
    if (!routerIsReady) return;

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
  }, [routerIsReady, routerQuery]);

  return (
    <div
      className="h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
    >
      <div className="px-10 max-w-md mx-auto pt-16 pb-9 text-center">
        <p className="text-base poppins-semibold text-neutral800">
          {routerQuery.setting === "1"
            ? t("linkAccountFailedTitle1")
            : t("linkAccountFailedTitle")}
        </p>
        <div className="mt-20">
          <Image
            src={`${assetPrefix}/images/linkAccountFailure.svg`}
            width="196px"
            height="196px"
            alt="liveness-failure-ill"
          />
        </div>
        {failedCount >= 5 && (
          <>
            <h1 className="text-base mt-5 poppins-semibold text-neutral800">
              {t("linkAccountFailed5x.title")}
            </h1>
            <p className="text-center mt-1 poppins-regular text-neutral800">
              {t("linkAccountFailed5x.subtitle")}
            </p>
          </>
        )}
        {props.checkStepResultDataRoute === "penautan_consent" ? (
          routerQuery.reject_by_user === "1" ? (
            <div className="mt-14">
              <p className="poppins-regular text-xs text-neutral200">
                {t("consentLinkAccountFailedSubtitleRejectByUser")}
              </p>
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
                      themeConfiguration?.data.actionFontColor as string
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
                      themeConfiguration?.data.actionFontColor as string
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
        ) : (failedCount >= 5 && props.checkStepResultDataRoute !== null) ||
          props.checkStepResultResponseData?.[0] ===
            "registrationId tidak valid" ? (
          redirectUrl ? (
            <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
              <a
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.actionFontColor as string
                  ),
                }}
                className={buttonVariants({
                  variant: "link",
                  size: "none",
                  className: "font-medium",
                })}
                onClick={() => resetFRFailedCount("count")}
                href={concateRedirectUrlParams(redirectUrl, "")}
              >
                {t("livenessSuccessButtonTitle")}
              </a>
            </div>
          ) : (
            <></>
          )
        ) : (
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
                    themeConfiguration?.data.actionFontColor as string
                  ),
                }}
                className={buttonVariants({
                  variant: "link",
                  size: "none",
                  className: "font-medium",
                })}
              >
                {routerQuery.setting === "1"
                  ? t("linkAccountTilaka1")
                  : t("linkAccountTilaka")}
              </a>
            </Link>
          </div>
        )}
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
