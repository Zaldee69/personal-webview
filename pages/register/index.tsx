import React, { useEffect, useState } from "react";
import Liveness, { TQueryParams } from "./components/liveness/Liveness";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import {
  RestGenerateOTPRegistration,
  RestKycCheckStepv2,
  RestKycFinalForm,
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
import Loading from "@/components/Loading";
import i18n from "i18";

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

  const { t }: any = i18n;
  const { message } = props?.checkStepResult || {};
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

      const params: TQueryParams = {
        request_id: routerQuery.request_id as string,
      };

      if (props.step !== "liveness-success") {
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
      }
    }
  };

  const finalForm = (reason_code?: string | null) => {
    setIsLoading(true);
    const query: any = {
      ...routerQuery,
      registration_id: router.query.request_id,
    };

    const params = {
      register_id: props.uuid,
      request_id: props.uuid,
      status: "S",
      reason_code: "",
    };

    if (reason_code) {
      query.reason_code = reason_code;
    }

    RestKycFinalForm({
      payload: {
        registerId: props.uuid,
      },
    })
      .then((res) => {
        if (res.success) {
          setIsLoading(false);
          params.reason_code = res.data.reason_code!;
          if (routerQuery.redirect_url) {
            const queryString = new URLSearchParams(params as any).toString();

            window.top!.location.href = concateRedirectUrlParams(
              routerQuery.redirect_url as string,
              queryString
            );
          } else {
            if (
              res.data.reason_code === "1" &&
              props.step !== "liveness-failure"
            ) {
              return router.replace({
                pathname: handleRoute("register"),
                query: {
                  ...query,
                  step: "liveness-failure",
                },
              });
            }

            if (props.step !== "form-success") {
              router.replace({
                pathname: handleRoute("register"),
                query: {
                  ...query,
                  step: "form-success",
                },
              });
            }
          }
        }
      })
      .catch((err) => console.log(err));
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
      res.data?.status === "D"
    ) {
      finalForm(res.data?.reason_code);
    } else {
      toast.error(errorMessage, {
        autoClose: 1500,
      });
      handleOtherStatus(res.data);
    }
  };

  const handleOtherStatus = (data: TKycCheckStepResponseData["data"]) => {
    if (data?.status === "F" && data.pin_form && routerQuery.redirect_url) {
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
    } else if (data?.status === "F" && routerQuery.dashboard_url) {
      handleDashboardRedirect(data);
    } else if (
      data?.reason_code === "1" &&
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
    if (data?.reason_code) {
      query.reason_code = data.reason_code;
    }
    if (props.step !== "liveness-failure") {
      setTimeout(() => {
        router.push({
          pathname: handleRoute("register"),
          query: { ...query, step: "liveness-failure" },
        });
      }, 1500);
    }
  };

  useEffect(() => {
    localStorage.setItem(
      props.uuid,
      props.checkStepResult?.data?.token as string
    );
    if (props.checkStepResult.message === "Error, Unknown requestId") {
      toast.error(props.checkStepResult.message);
    } else {
      handleResponse(props.checkStepResult);
    }
  }, [props.checkStepResult.success]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading title={t("loadingTitle")} />
      </div>
    );
  } else {
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
