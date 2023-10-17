import { assetPrefix } from "next.config";
import { concateRedirectUrlParams } from "./concateRedirectUrlParams";
import { handleRoute } from "./handleRoute";
import { IserverSideRenderReturnConditions } from "@/interface/interface";

export const serverSideRenderReturnConditions = ({
  context,
  checkStepResult,
  isNotRedirect,
}: IserverSideRenderReturnConditions) => {
  const currentPathnameWithoutParams = context.resolvedUrl.split("?")[0];
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;

  if (checkStepResult.err) {
    if (checkStepResult?.err.response?.data?.data?.errors?.[0]) {
      // ?
    } else {
      // ?
    }
  } else {
    if (checkStepResult.res?.success) {
      if (checkStepResult.res.data.status === "D") {
        if (checkStepResult.res.data.pin_form) {
          const params = { ...cQuery, registration_id: uuid };
          const queryString = new URLSearchParams(params as any).toString();

          if (
            currentPathnameWithoutParams === `${assetPrefix}/kyc/pinform` ||
            currentPathnameWithoutParams === "/kyc/pinform"
          ) {
            return { props: {} };
          }

          return {
            redirect: {
              permanent: false,
              destination: handleRoute("kyc/pinform?" + queryString),
            },
            props: {
              //   kyc_checkstep_token: checkStepResult.res?.data?.token || null,
            },
          };
        } else {
          const params = { ...cQuery, request_id: uuid };
          const queryString = new URLSearchParams(params as any).toString();

          if (
            currentPathnameWithoutParams === `${assetPrefix}/form` ||
            currentPathnameWithoutParams === "/form"
          ) {
            return { props: {} };
          }

          return {
            redirect: {
              permanent: false,
              destination: handleRoute("form?" + queryString),
            },
            props: {
              //   kyc_checkstep_token: checkStepResult.res?.data?.token || null,
            },
          };
        }
      } else if (checkStepResult.res.data.status === "B") {
        const params = { ...cQuery, request_id: uuid };
        const queryString = new URLSearchParams(params as any).toString();

        if (
          currentPathnameWithoutParams === `${assetPrefix}/guide` ||
          currentPathnameWithoutParams === "/guide" ||
          // not redirect when status is equal to "B" and currentPathnameWithoutParams is equal to '/liveness-fail'
          currentPathnameWithoutParams === `${assetPrefix}/liveness-fail` ||
          currentPathnameWithoutParams === "/liveness-fail"
        ) {
          return { props: {} };
        }

        if (currentPathnameWithoutParams !== "/liveness") {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute("guide?" + queryString),
            },
            props: {
              // kyc_checkstep_token: checkStepResult.res?.data?.token || null,
            },
          };
        }
      } else if (
        checkStepResult.res.data.status === "F" ||
        checkStepResult.res.data.status === "E"
      ) {
        const params: any = {
          ...cQuery,
          request_id: uuid,
          register_id: uuid,
        };

        const { reason_code, token, route, status } = checkStepResult.res.data;

        if (reason_code) {
          params.reason_code = reason_code;
        }

        if (token) {
          params.token = token;
        }

        if (route === "done_set_password") {
          params.status = "S";
        } else {
          params.status = status;
        }

        const queryString = new URLSearchParams(params as any).toString();

        if (
          checkStepResult.res.data.status === "F" &&
          checkStepResult.res.data.pin_form &&
          cQuery.redirect_url
        ) {
          const status =
            checkStepResult.res.data.reason_code === "1" ? "S" : "F";
          return {
            redirect: {
              permanent: false,
              destination: concateRedirectUrlParams(
                cQuery.redirect_url as string,
                `status=${status}%26register_id=${uuid}%26register_id=${uuid}${
                  checkStepResult.res.data.reason_code
                    ? "%26reason_code=" + checkStepResult.res.data.reason_code
                    : ""
                }`
              ),
            },
            props: {},
          };
        } else if (checkStepResult.res.data?.route === "done_set_password" && !currentPathnameWithoutParams.includes("/link-account")) {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute("manual-form/success?" + queryString),
            },
            props: {},
          };
        } else if (checkStepResult.res.data?.route === "set_password") {
          if (!currentPathnameWithoutParams.includes("/manual-form/final")) {
            return {
              redirect: {
                permanent: false,
                destination: handleRoute("manual-form/final?" + queryString),
              },
              props: {},
            };
          } else {
            return { props: {} };
          }
        }

        if (
          currentPathnameWithoutParams === `${assetPrefix}/liveness-failure` ||
          currentPathnameWithoutParams === "/liveness-failure" ||
          isNotRedirect
        ) {
          return { props: {} };
        }

        return {
          redirect: {
            permanent: false,
            destination: handleRoute("liveness-failure?" + queryString),
          },
          props: {
            // kyc_checkstep_token: checkStepResult.res?.data?.token || null,
          },
        };
      } else if (checkStepResult.res.data.status === "S") {
        const params: any = {
          status: checkStepResult.res.data.status,
          request_id: uuid,
          register_id: uuid,
          redirect_url: cQuery.redirect_url,
        };

        if (checkStepResult.res.data.reason_code) {
          params.reason_code = checkStepResult.res.data.reason_code;
        }

        params.request_id = uuid;
        params.register_id = uuid;

        const queryString = new URLSearchParams(params).toString();

        if (checkStepResult.res.data.pin_form) {
          if (cQuery.redirect_url) {
            return {
              redirect: {
                permanent: false,
                destination: concateRedirectUrlParams(
                  cQuery.redirect_url as string,
                  `status=${
                    params.status
                  }%26register_id=${uuid}%26request_id=${uuid}${
                    checkStepResult.res.data.reason_code
                      ? "%26reason_code=" + checkStepResult.res.data.reason_code
                      : ""
                  }`
                ),
              },
            };
          } else {
            return {
              props: {},
            };
          }
        }

        if (!isNotRedirect) {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute("/form/success?" + queryString),
            },
            props: {},
          };
        }

        return {
          props: {},
        };
      } else if (
        checkStepResult.res?.data?.route === "penautan" ||
        checkStepResult.res?.data?.route === "penautan_consent"
      ) {
        const params: any = { ...cQuery, request_id: uuid };
        const queryString = new URLSearchParams(params as any).toString();

        if (
          !currentPathnameWithoutParams.includes("/link-account") &&
          !isNotRedirect
        ) {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute("link-account?" + queryString),
            },
            props: {},
          };
        }
      } else {
        return { props: {} };
      }
    } else {
      if (
        checkStepResult.res?.data?.errors?.[0] ===
          "registrationId tidak valid" &&
        checkStepResult?.res?.data?.route?.length < 1
      ) {
        const params: any = { ...cQuery, request_id: uuid };
        const queryString = new URLSearchParams(params as any).toString();
        if (
          currentPathnameWithoutParams ===
            `${assetPrefix}/link-account/failure` ||
          currentPathnameWithoutParams === "/link-account/failure" ||
          currentPathnameWithoutParams ===
            `${assetPrefix}/link-account/success` ||
          currentPathnameWithoutParams === "/link-account/success" ||
          currentPathnameWithoutParams === `${assetPrefix}/link-account` ||
          currentPathnameWithoutParams === "/link-account" ||
          currentPathnameWithoutParams.includes("/liveness") ||
          isNotRedirect
        ) {
          return {
            props: {},
          };
        }

        return {
          redirect: {
            permanent: false,
            destination: handleRoute("link-account/failure?" + queryString),
          },
          props: {},
        };
      } else if (checkStepResult?.res?.data?.route === "manual_form") {
        const params: any = {
          ...cQuery,
          request_id: uuid,
          tilaka_name: checkStepResult.res.data.user_identifier,
          next_path: "manual_form",
        };
        const queryString = new URLSearchParams(params as any).toString();

        if (
          !currentPathnameWithoutParams.includes("/manual-form") &&
          !currentPathnameWithoutParams.includes(
            "/link-account/linking/failure"
          )
        ) {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute(
                "link-account/linking/failure?" + queryString
              ),
            },
            props: {},
          };
        }
      } else if (checkStepResult?.res?.data?.route === "done_manual_form") {
        const params: any = {
          ...cQuery,
          request_id: uuid,
          tilaka_name: checkStepResult.res.data.user_identifier,
        };
        const queryString = new URLSearchParams(params as any).toString();

        if (!currentPathnameWithoutParams.includes("/manual-form/on-process")) {
          return {
            redirect: {
              permanent: false,
              destination: handleRoute("manual-form/on-process?" + queryString),
            },
            props: {},
          };
        }
      } else {
        return { props: {} };
      }
    }
  }

  return {
    props: {
      // pass kyc_checkstep_token to page as props
      //   kyc_checkstep_token: checkStepResult.res?.data?.token || null,
      //
      // call this effect to each page
      //   useEffect(() => {
      //     setKycCheckstepTokenToLocalStorage(kyc_checkstep_token);
      //   }, [kyc_checkstep_token]);
    },
  };
};
