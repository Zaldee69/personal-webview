import { concateRedirectUrlParams } from "./concateRedirectUrlParams";
import { handleRoute } from "./handleRoute";
import { IserverSideRenderReturnConditions } from "@/interface/interface";

const getRedirectProps = (
  destination: string,
  isPermanent = false,
  props = {}
) => {
  return {
    redirect: {
      permanent: isPermanent,
      destination: destination,
    },
    props: props,
  };
};

const generateQueryString = (params: Record<string, any>): string => {
  return new URLSearchParams(params).toString();
};

const generateUrl = (path: string, params: any) => {
  return handleRoute(path + generateQueryString(params));
};

export const serverSideRenderReturnConditions = ({
  context,
  checkStepResult,
  isNotRedirect,
}: IserverSideRenderReturnConditions) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id ?? cQuery.request_id ?? cQuery.registration_id;
  const { res: result, err: error } = checkStepResult;

  const isCurrentPathname = (path: string): boolean => {
    const currentPathnameWithoutParams = context.resolvedUrl.split("?")[0];
    return currentPathnameWithoutParams.includes(path);
  };

  if (error) {
    console.log(error);
    return { props: {} };
  } else {
    if (result?.success) {
      const { reason_code, token, route, status, pin_form } = result.data;

      const paramsForStatusDandB = { ...cQuery, registration_id: uuid };

      const paramsForStatusFandE: any = {
        ...cQuery,
        request_id: uuid,
        register_id: uuid,
      };

      const paramsForStatusS: Record<string, any> = {
        status: status,
        request_id: uuid,
        register_id: uuid,
        redirect_url: cQuery.redirect_url,
      };

      const paramsForLinking: Record<string, any> = {
        ...cQuery,
        request_id: uuid,
      };

      switch (result.data.status) {
        case "D":
          if (pin_form) {
            if (isCurrentPathname("/kyc/pinform")) {
              return { props: {} };
            }
            return getRedirectProps(
              generateUrl("kyc/pinform", paramsForStatusDandB)
            );
          } else if (isCurrentPathname("/form")) {
            return { props: {} };
          } else {
            return getRedirectProps(generateUrl("form?", paramsForStatusDandB));
          }
        case "B":
          if (
            isCurrentPathname("/guide") ||
            isCurrentPathname("/livenenss-fail")
          ) {
            return { props: {} };
          } else if (!isCurrentPathname("/liveness")) {
            return getRedirectProps(
              generateUrl("guide?", paramsForStatusDandB)
            );
          }
          break;
        case "S":
          if (reason_code) {
            paramsForStatusS.reason_code = reason_code;
          }

          paramsForStatusS.request_id = uuid;
          paramsForStatusS.register_id = uuid;

          if (!isNotRedirect) {
            return getRedirectProps(
              generateUrl("form/success??", paramsForStatusS)
            );
          } else {
            return {
              props: {},
            };
          }
        default:
          if (status === "F" || status === "E") {
            if (reason_code) {
              paramsForStatusFandE.reason_code = reason_code;
            }

            if (token) {
              paramsForStatusFandE.token = token;
            }

            if (route === "done_set_password") {
              paramsForStatusFandE.status = "S";
            } else {
              paramsForStatusFandE.status = status;
            }

            if (status === "F" && pin_form && cQuery.redirect_url) {
              paramsForStatusFandE.register_id = uuid;
              return getRedirectProps(
                concateRedirectUrlParams(
                  cQuery.redirect_url as string,
                  paramsForStatusFandE
                )
              );
            } else if (route === "done_set_password") {
              return getRedirectProps(
                generateUrl("manual-form/success?", paramsForStatusFandE)
              );
            } else if (route === "set_password") {
              return getRedirectProps(
                generateUrl("manual-form/final?", paramsForStatusFandE)
              );
            } else if (
              isCurrentPathname("/liveness-failure") &&
              isNotRedirect
            ) {
              return { props: {} };
            } else {
              return getRedirectProps(
                generateUrl("liveness-failure?", paramsForStatusFandE)
              );
            }
          } else if (route === "penautan" || route === "penautan_consent") {
            if (!isCurrentPathname("/link-account") && !isNotRedirect) {
              return getRedirectProps(
                generateUrl("link-account?", paramsForLinking)
              );
            }
          } else {
            return { props: {} };
          }
          break;
      }
    } else if (
      checkStepResult.res?.data.errors?.[0] &&
      checkStepResult?.res?.data?.route?.length < 1
    ) {
      const params: any = { ...cQuery, request_id: uuid };
      if (
        (isCurrentPathname("/link-account/failure") &&
          isCurrentPathname("/link-account/success") &&
          isCurrentPathname("/link-account") &&
          isCurrentPathname("/liveness")) ||
        isNotRedirect
      ) {
        return {
          props: {},
        };
      } else {
        getRedirectProps("/link-account/failure", params);
      }
    } else if (checkStepResult?.res?.data?.route === "manual_form") {
      const params: any = {
        ...cQuery,
        request_id: uuid,
        tilaka_name: checkStepResult.res.data.user_identifier,
        next_path: "manual_form",
      };
      if (
        !isCurrentPathname("/manual-form") &&
        !isCurrentPathname("/link-account/linking/failure")
      ) {
        return getRedirectProps("/link-account/linking/failure?", params);
      }
    } else if (checkStepResult?.res?.data?.route === "done_manual_form") {
      const params: any = {
        ...cQuery,
        request_id: uuid,
        tilaka_name: checkStepResult.res.data.user_identifier,
      };

      if (!isCurrentPathname("/manual-form/on-process")) {
        return getRedirectProps("/manual-form/on-process", params);
      }
    } else {
      return { props: {} };
    }

    return {
      props: {},
    };
  }
};
