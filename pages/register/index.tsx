import React from "react";
import Liveness from "./components/liveness/Liveness";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import {
  RestGenerateOTPRegistration,
  RestKycCheckStepv2,
} from "infrastructure";
import { TOTPResponse } from "infrastructure/rest/personal/types";
import LivenessFail from "./components/liveness/LivenessFail";
import LivenessFailure from "./components/liveness/LivenessFailure";
import LivenessSuccess from "./components/liveness/LivenessSuccess";
import Manual from "./components/form/Manual";
import { useRouter } from "next/router";
import { handleRoute } from "@/utils/handleRoute";
import FormSuccess from "./components/form/Success";
import PinForm from "./components/form/PinForm";

interface Props extends TOTPResponse {
  uuid: string;
  checkStepResult: TKycCheckStepResponseData;
  step:
    | "liveness-fail"
    | "liveness-failure"
    | "liveness-success"
    | "manual-form"
    | "form-success"
    | "pin-form"
    | null;
}

const Index = (props: Props) => {
  const { status, pin_form, route, nationality_type, reason_code } =
    props?.checkStepResult?.data || {};

  const router = useRouter();

  if (status === "D" && !pin_form) {
    router.push({
      pathname: handleRoute("form"),
      query: router.query,
    });
  }

  if (props.step === "liveness-fail") {
    return <LivenessFail />;
  } else if (props.step === "liveness-failure") {
    return <LivenessFailure status={status} />;
  } else if (props.step === "liveness-success") {
    return <LivenessSuccess />;
  } else if (props.step === "manual-form") {
    return (
      <Manual
        checkStepResultDataRoute={route}
        nationalityType={nationality_type}
      />
    );
  } else if (props.step === "form-success") {
    return <FormSuccess />;
  } else if (props.step === "pin-form") {
    return <PinForm />;
  } else {
    return <Liveness {...props} />;
  }
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;
  const step = cQuery.step || null;

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
      console.log("failed to checkstep:", err);
      return { err };
    });

  const generateOTPResults = await RestGenerateOTPRegistration({
    request_id: uuid as string,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });

  return {
    props: {
      ...generateOTPResults,
      uuid: uuid ? uuid : "",
      checkStepResult: checkStepResult.res || {},
      step,
    },
  };
};
