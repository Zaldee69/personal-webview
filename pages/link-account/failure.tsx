import { handleRoute } from "@/utils/handleRoute";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { RestKycCheckStep } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";

type Props = {
  checkStepResultDataRoute: TKycCheckStepResponseData["data"]["route"];
};

const LinkAccountFailure = (props: Props) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } = router.query;
  const { t }: any = i18n;

  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="text-base poppins-semibold text-neutral800">
        {t("linkAccountFailedTitle")}
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/linkAccountFailure.svg`}
          width="196px"
          height="196px"
          alt="liveness-failure-ill"
        />
      </div>
      <div className="mt-14">
        <p className="poppins-regular text-xs text-neutral200">
          {t("linkAccountFailedSubtitle")}
        </p>
      </div>
      {props.checkStepResultDataRoute === "penautan_consent" ? (
        routerQuery.redirect_url && (
          <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
            <a href={concateRedirectUrlParams(routerQuery.redirect_url, "")}>
              <a>{t("livenessSuccessButtonTitle")}</a>
            </a>
          </div>
        )
      ) : (
        <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
          <Link
            href={{
              pathname: handleRoute("link-account"),
              query: { ...router.query },
            }}
          >
            <a>{t("linkAccountTilaka")}</a>
          </Link>
        </div>
      )}
      <div className="mt-11 flex justify-center">
        <Image
          src={`${assetPrefix}/images/poweredByTilaka.svg`}
          alt="powered-by-tilaka"
          width="80px"
          height="41.27px"
        />
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
    checkStepResultDataRoute: checkStepResult.res?.data.route || null,
  };

  return serverSideRenderReturnConditionsResult;
};

export default LinkAccountFailure;
