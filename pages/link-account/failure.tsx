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

type Props = {};

const LinkAccountFailure = (props: Props) => {
  const router = useRouter();
  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="font-poppins text-base font-semibold text-neutral800">
        Penautan Akun Gagal
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
        <p className="font-poppins text-xs text-neutral200">
          Pastikan data sesuai dengan akun Tilaka yang akan ditautkan.
        </p>
      </div>
      <div className="mt-20 text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
        <Link
          href={{
            pathname: handleRoute("/link-account"),
            query: { ...router.query },
          }}
        >
          <a>Tautkan Akun Tilaka</a>
        </Link>
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

export default LinkAccountFailure;
