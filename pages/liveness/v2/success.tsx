import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { RestKycCheckStep } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../../next.config";
import i18n from "i18";
import { useEffect } from "react";
import { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";

type Props = {};

const FormSuccess = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const uuid =
    router.query.transaction_id ||
    router.query.request_id ||
    router.query.registration_id;
  const params = {
    status: "True",
    uuid,
  };

  const { generatedUrl } = useGenerateRedirectUrl({
    params,
    url: routerQuery.redirect_url as string,
  });

  useEffect(() => {
    if (routerQuery.redirect_url) {
      window.top!.location.href = generatedUrl;
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Heading>{t("livenessSuccess")}</Heading>
      <div
        className="bg-contain mx-auto mt-10 w-60 h-64 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
            themeConfiguration.data.asset_liveness_v2_success as string,
            "ASSET",
            `${assetPrefix}/images/livenessSucc.svg`
          )})`,
        }}
      ></div>
      {routerQuery.redirect_url && (
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
          href={generatedUrl}
        >
          {t("livenessSuccessButtonTitle")}
        </a>
      )}
      <div className="mt-20">
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

export default FormSuccess;
