import { assetPrefix } from "../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { restLogout } from "infrastructure/rest/b2b";
import { handleRoute } from "./../../utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { RestKycCheckStep } from "infrastructure";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";

type Props = {};

const LinkAccountSuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    signing?: "1";
    redirect_url?: string;
  } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";
  const [redirectUrl, setRedirectUrl] = useState<string>(
    routerQuery.redirect_url as string
  );

  const { t }: any = i18n;

  useEffect(() => {
    if (!routerIsReady) return;
    if (!isSigning) {
      let queryWithDynamicRedirectURL = {
        ...routerQuery,
      };
      const params = {
        "request-id": queryWithDynamicRedirectURL.request_id,
        "tilaka-name": queryWithDynamicRedirectURL.tilaka_name,
      };
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
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="text-base poppins-semibold text-neutral800">
        {t("linkAccountSuccessTitle")}
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/linkAccountSuccess.svg`}
          width="196px"
          height="196px"
          alt="liveness-success-ill"
        />
      </div>
      <div className="mt-14">
        <p className="poppins-regular text-xs text-neutral200">
          {t("linkAccountSuccessSubtitle")}
        </p>
      </div>
      {!isSigning && redirectUrl && (
        <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
          <a href={concateRedirectUrlParams(redirectUrl, "")}>
            <a>{t("livenessSuccessButtonTitle")}</a>
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
