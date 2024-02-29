import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";
import { RootState } from "@/redux/app/store";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import { assetPrefix } from "next.config";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

interface IParams {
  request_id: string;
  tilaka_name: string;
  status: string
}

interface Props {
  tilaka_name: string
}

const Index = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { request_id, tilaka_name, redirect_url } = routerQuery;

  const params: IParams = {
    request_id: request_id as string,
    tilaka_name: tilaka_name as string || props.tilaka_name,
    status: "S"
  };

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: redirect_url as string,
  });

  useEffect(() => {
    autoRedirect();
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
      <div className="px-5 pt-8 max-w-md mx-auto text-center">
        <div>
          <Heading className="text-lg mb-14">
            {t("registrationInProcessTitle")}
          </Heading>
          <Image
            src={`${assetPrefix}/images/waiting.svg`}
            width="196"
            height="194"
            alt="liveness-success-ill"
          />
          <Paragraph className="text-md whitespace-break-spaces text-neutral200 mt-14">
            {t("registrationInProcessSubtitle")}
          </Paragraph>
          <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
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
                  className: "font-semibold",
                })}
                href={generatedUrl}
              >
                {t("livenessSuccessButtonTitle")}
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
  const isNotRedirect = true;
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
    serverSideRenderReturnConditions({ context, checkStepResult, isNotRedirect });

  serverSideRenderReturnConditionsResult["props"] = {
    ...serverSideRenderReturnConditionsResult["props"],
    tilaka_name: checkStepResult.res?.data?.user_identifier || null,
  };

  return serverSideRenderReturnConditionsResult;
};

export default Index;
