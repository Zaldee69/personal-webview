import { assetPrefix } from "../../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { restLogout } from "infrastructure/rest/b2b";
import { handleRoute } from "./../../../utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
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
    signing?: "1";
    redirect_url?: string;
    request_id?: string,
    tilaka_name?: string
  } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";


  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params: {
      request_id: routerQuery.request_id,
      tilaka_name: routerQuery.tilaka_name,
      status: "S"
    },
    url: routerQuery.redirect_url as string,
  });

  useEffect(() => {
    if (!routerIsReady) return;
    if (!isSigning) {
     autoRedirect()
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
      className="px-10 pt-16 pb-9 text-center min-h-screen"
    >
      <Heading>{t("linkAccountSuccessTitle")}</Heading>
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
      <div className="mt-14">
        <Paragraph size="sm" >
          {t("linkAccountSuccessSubtitle")}
        </Paragraph>
      </div>
      {!isSigning && routerQuery.redirect_url && (
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
            href={concateRedirectUrlParams(generatedUrl, "")}
          >
            <a>{t("livenessSuccessButtonTitle")}</a>
          </a>
        </div>
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
