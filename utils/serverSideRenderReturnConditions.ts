import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { handleRoute } from "./handleRoute";

interface IserverSideRenderReturnConditions {
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>;
  checkStepResult: {
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
  };
}
export const serverSideRenderReturnConditions = ({
  context,
  checkStepResult,
}: IserverSideRenderReturnConditions) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;

  console.log(checkStepResult.err?.response.data);

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
        return {
          redirect: {
            permanent: false,
            destination: handleRoute("guide?" + queryString),
          },
          props: {
            // kyc_checkstep_token: checkStepResult.res?.data?.token || null,
          },
        };
      } else if (
        checkStepResult.res.data.status === "E" ||
        checkStepResult.res.data.status === "F"
      ) {
        const params = { ...cQuery, request_id: uuid };
        const queryString = new URLSearchParams(params as any).toString();
        return {
          redirect: {
            permanent: false,
            destination: handleRoute("liveness-failure?" + queryString),
          },
          props: {
            // kyc_checkstep_token: checkStepResult.res?.data?.token || null,
          },
        };
      } else {
        // ?
      }
    } else {
      // ?
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
