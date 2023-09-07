import { assetPrefix } from "../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { restLogout } from "infrastructure/rest/b2b";
import { handleRoute } from "./../../utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";

type Props = {};

const LinkAccountSuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    setting?: "1";
    signing?: "1";
    redirect_url?: string;
    tilaka_name?: string;
    request_id?: string;
  } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";

  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const {redirect_url, request_id, tilaka_name} = routerQuery

  const { generatedUrl } = useGenerateRedirectUrl({
    url: redirect_url as string,
    params: {
      request_id,
      tilaka_name
    }
  });

  useEffect(() => {
    if (!routerIsReady) return;
    if (!isSigning) {
      restLogout({});
      setTimeout(() => {
        window.top!.location.href = generatedUrl;
      }, 5000);
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
      className="px-10 min-h-screen pt-16 pb-9 text-center"
    >
      <Heading>
        {routerQuery.setting === "1"
          ? t("linkAccountSuccessTitle1")
          : t("linkAccountSuccessTitle")}
      </Heading>
      <div
        className="bg-contain mt-5 w-52 mx-auto h-64 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
            themeConfiguration.data.asset_activation_success as string,
            "ASSET",
            `${assetPrefix}/images/linkAccountSuccess.svg`
          )})`,
        }}
      ></div>
      <div className="mt-14">
        <Paragraph size="sm">
          {routerQuery.setting === "1"
            ? t("linkAccountSuccessSubtitle1")
            : t("linkAccountSuccessSubtitle")}
        </Paragraph>
      </div>
      {!isSigning && redirect_url && (
        <a href={generatedUrl}>
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
          >
            {t("livenessSuccessButtonTitle")}
          </a>
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
  } = await RestKycCheckStepv2({
    registerId: uuid as string,
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

export default LinkAccountSuccess;
