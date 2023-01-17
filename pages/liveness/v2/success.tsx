import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { RestKycCheckStep } from "infrastructure";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../../next.config";
import i18n from "i18";
import { useEffect } from "react";

type Props = {};

const FormSuccess = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const {t} : any = i18n

  useEffect(() => {
    if(routerQuery.redirect_url) {
      setTimeout(() => {
        router.push({
          pathname: routerQuery.redirect_url as string,
        })
      }, 5000)
    }
  }, [router.isReady])

  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="text-base poppins-semibold text-neutral800">
        {t("livenessSuccess")}
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/livenessSucc.svg`}
          width="196px"
          height="194px"
          alt="liveness-success-ill"
        />
      </div>
      <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
        {routerQuery.redirect_url && (
          <a
            href={concateRedirectUrlParams(
              routerQuery.redirect_url as string,
              ""
            )}
          >
            {t("livenessSuccessButtonTitle")}
          </a>
        )}
      </div>
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
