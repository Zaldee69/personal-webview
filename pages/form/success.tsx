import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { handleRoute } from "@/utils/handleRoute";
import Footer from "@/components/Footer";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { buttonVariants } from "@/components/atoms/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Paragraph from "@/components/atoms/Paraghraph";
import Heading from "@/components/atoms/Heading";

type Props = {};

const FormSuccess = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 flex flex-col justify-center items-center text-center gap-10 pt-16 min-h-screen"
    >
      <Heading>
        {t("livenessSuccessTitle")}
      </Heading>
      <div
        className="bg-contain w-60 h-64 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
            themeConfiguration.data.asset_registration_status_success as string,
            "ASSET",
            `${assetPrefix}/images/livenessSucc.svg`
          )})`,
        }}
      ></div>
      <div className="mt-14">
        <Paragraph>
          {t("livenessSuccessSubtitle")}
        </Paragraph>
      </div>
      <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
        {routerQuery.redirect_url && (
          <a
            href={concateRedirectUrlParams(
              routerQuery.redirect_url as string,
              ""
            )}
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
            {t("livenessSuccessButtonTitle")}
          </a>
        )}
      </div>
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;
  const params = { ...cQuery, registration_id: uuid };
  const queryString = new URLSearchParams(params as any).toString();

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

export default FormSuccess;
