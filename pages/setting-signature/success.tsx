import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { restLogout } from "infrastructure/rest/b2b";
import { GetServerSideProps } from "next";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";

import { assetPrefix } from "../../next.config";
import { handleRoute } from "./../../utils/handleRoute";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { RestKycCheckStep } from "infrastructure";

type Props = {};

const SettingSignatureSuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    signing?: "1";
    redirect_url?: string;
  } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";

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
  }, [isSigning, routerIsReady]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="text-base poppins-semibold text-neutral800">
        {t("settingSignatureSuccessTitle")}
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/linkAccountSuccess.svg`}
          width="196px"
          height="196px"
          alt="setting-signature-success-ill"
        />
      </div>
      {!isSigning && routerQuery.redirect_url && (
        <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
          <a href={concateRedirectUrlParams(routerQuery.redirect_url, "")}>
            <p>{t("settingSignatureSuccessButton")}</p>
          </a>
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

export default SettingSignatureSuccess;
