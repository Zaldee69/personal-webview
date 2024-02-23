import React, { useEffect } from "react";
import Liveness, { TQueryParams } from "./components/liveness/Liveness";
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
import { toast } from "react-toastify";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";

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

  const { message } = props?.checkStepResult || {};

  const router = useRouter();
  const routerQuery = router.query;

  const handleResponse = (res: {
    success: boolean;
    message?: string;
    data: TKycCheckStepResponseData["data"];
  }) => {
    if (res.success && !["D", "F", "E"].includes(res.data.status)) {
      if (res.data.status === "S") {
        handleStatusS(res.data);
      }
    } else {
      handleStatusDFE(res);
    }
  };

  const handleStatusS = (data: TKycCheckStepResponseData["data"]) => {
    const params: TQueryParams & { register_id?: string } = {};

    if (routerQuery.redirect_url) {
      params.status = data.status;
      if (!data.pin_form) {
        params.redirect_url = routerQuery.redirect_url as string;
      }
    }

    if (data.pin_form) {
      handleDedicatedChannel(data);
    } else {
      handleRegularChannel(data);
    }
  };

  const handleDedicatedChannel = (data: TKycCheckStepResponseData["data"]) => {
    const params: TQueryParams & {
      register_id?: string;
      reason_code?: string;
    } = {
      register_id: routerQuery.request_id as string,
      reason_code: data.reason_code as string,
    };
    const queryString = new URLSearchParams(params as any).toString();
    if (routerQuery.redirect_url) {
      window.top!.location.href = concateRedirectUrlParams(
        routerQuery.redirect_url as string,
        queryString
      );
    }
  };

  const handleRegularChannel = (data: TKycCheckStepResponseData["data"]) => {
    if (props.step !== "form-success") {
      toast.success("Proses registrasi telah selesai", {
        autoClose: 1500,
      });
    }

    const params: TQueryParams = {
      request_id: routerQuery.request_id as string,
    };

    setTimeout(() => {
      router.replace({
        pathname: handleRoute("register"),
        query: {
          ...params,
          reason_code: data.reason_code,
          step: "form-success",
        },
      });
    }, 1500);
  };

  const handleStatusDFE = (res: {
    data: TKycCheckStepResponseData["data"];
    message?: string;
  }) => {
    const errorMessage =
      reason_code === "3"
        ? "Registration ID kedaluarsa"
        : reason_code === "2" || reason_code === "1"
        ? "Proses registrasi telah gagal"
        : message;

    if (
      res.message === "Anda berada di tahap pengisian formulir" ||
      res.data.status === "D"
    ) {
      handleFormSubmission(res.data);
    } else {
      toast.error(errorMessage, {
        autoClose: 1500,
      });
      handleOtherStatus(res.data);
    }
  };

  const handleFormSubmission = (data: TKycCheckStepResponseData["data"]) => {
    if (data.pin_form) {
      router.replace({
        pathname: handleRoute("register"),
        query: {
          ...routerQuery,
          registration_id: routerQuery.request_id,
          step: "pin-form",
        },
      });
    } else {
      // finalForm(data.reason_code);
    }
  };

  const handleOtherStatus = (data: TKycCheckStepResponseData["data"]) => {
    if (data.status === "F" && data.pin_form && routerQuery.redirect_url) {
      const params: TQueryParams & { register_id?: string } = {
        status: data.status,
        register_id: routerQuery.request_id as string,
      };
      if (data.reason_code) {
        params.reason_code = data.reason_code;
      }
      const queryString = new URLSearchParams(params as any).toString();
      window.top!.location.href = concateRedirectUrlParams(
        routerQuery.redirect_url as string,
        queryString
      );
    } else if (data.status === "F" && routerQuery.dashboard_url) {
      handleDashboardRedirect(data);
    } else if (
      data.reason_code === "1" &&
      data.pin_form &&
      routerQuery.redirect_url
    ) {
      handleRedirectToDedicatedChannel(data);
    } else {
      handleLivenessFailure(data);
    }
  };

  const handleDashboardRedirect = (data: TKycCheckStepResponseData["data"]) => {
    const params: TQueryParams = {
      request_id: routerQuery.request_id as string,
      reason_code: data.reason_code as string,
    };
    const queryString = new URLSearchParams(params as any).toString();
    const { hostname } = new URL(routerQuery.dashboard_url as string);
    if (hostname === "tilaka.id" || hostname.endsWith("tilaka.id")) {
      window.top!.location.href = concateRedirectUrlParams(
        routerQuery.dashboard_url as string,
        queryString
      );
    }
  };

  const handleRedirectToDedicatedChannel = (
    data: TKycCheckStepResponseData["data"]
  ) => {
    const params: TQueryParams & { register_id?: string } = {
      status: "S",
      register_id: routerQuery.request_id as string,
      reason_code: data.reason_code as string,
    };
    const queryString = new URLSearchParams(params as any).toString();
    window.top!.location.href = concateRedirectUrlParams(
      routerQuery.redirect_url as string,
      queryString
    );
  };

  const handleLivenessFailure = (data: TKycCheckStepResponseData["data"]) => {
    const query: TQueryParams = {
      ...routerQuery,
      request_id: routerQuery.request_id as string,
    };
    if (data.reason_code) {
      query.reason_code = data.reason_code;
    }
    setTimeout(() => {
      router.push({
        pathname: handleRoute("register"),
        query: { ...query, step: "liveness-failure" },
      });
    }, 1500);
  };

  useEffect(() => {
    if (props.checkStepResult.message === "Error, Unknown requestId") {
      toast.error(props.checkStepResult.message);
    } else {
      handleResponse(props.checkStepResult);
    }
  }, [props.checkStepResult.success]);

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
