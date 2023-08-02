import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/legacy/image";
import { restLogout } from "infrastructure/rest/b2b";
import { GetServerSideProps } from "next";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";

import { assetPrefix } from "../../next.config";
import { handleRoute } from "./../../utils/handleRoute";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { RestKycCheckStep } from "infrastructure";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";

type Props = {};

const SettingMFASuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    signing?: "1";
    redirect_url?: string;
  } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";

  const params = {
    tilaka_name: router.query.tilaka_name
  }

  const queryString = new URLSearchParams(params as any).toString();

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  useEffect(() => {
    if (!routerIsReady) return;
    if (!isSigning) {
      restLogout({});
    } else {
      setTimeout(() => {
        router.replace({
          pathname: handleRoute("signing"),
          query: { ...routerQuery },
        });
      }, 1000);
    }
  }, [isSigning, routerIsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 pt-16 min-h-screen pb-9 text-center"
    >
      <Heading>{t("settingMFASuccessTitle")}</Heading>
      <div
        className="bg-contain w-52 mx-auto h-64 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
            themeConfiguration.data.asset_activation_success as string,
            "ASSET",
            `${assetPrefix}/images/linkAccountSuccess.svg`
          )})`,
        }}
      ></div>
      {!isSigning && routerQuery.redirect_url && (
        <a
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.action_font_color as string
            ),
          }}
          className={buttonVariants({
            variant: "link",
            size: "none",
            className: "font-medium mt-20",
          })}
          href={concateRedirectUrlParams(routerQuery.redirect_url, queryString)}
        >
          <p>{t("settingSignatureSuccessButton")}</p>
        </a>
      )}
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const isNotRedirect: boolean = true;
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

  return serverSideRenderReturnConditions({
    context,
    checkStepResult,
    isNotRedirect,
  });
};

export default SettingMFASuccess;
