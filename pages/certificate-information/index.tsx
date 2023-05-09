type Props = {};
import { setCertificate } from "@/redux/slices/certificateSlice";
import { useEffect } from "react";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  RestRegisteredCertificate,
  RestConfirmCertificate,
} from "infrastructure/rest/b2b";
import { toast } from "react-toastify";
import { TConfirmCertificateRequestData } from "infrastructure/rest/b2b/types";
import { handleRoute } from "@/utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import i18n from "i18";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import Button, { buttonVariants } from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Footer from "@/components/Footer";

function CertificateInformation({}: Props) {
  const dispatch: AppDispatch = useDispatch();
  const { certificate } = useSelector((state: RootState) => state.certificate);
  const router = useRouter();
  const { company_id } = router.query;
  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const getRegisteredCertificate = () => {
    const body = {
      company_id: company_id as string,
    };
    RestRegisteredCertificate(body)
      .then((res) => {
        if (res?.data) {
          const result = JSON.parse(res.data[0]);
          dispatch(setCertificate(result));
        }
      })
      .catch((err) => {
        switch (err.response.status) {
          case 401:
            // unauthorized
            router.replace({
              pathname: handleRoute("login"),
              query: { ...router.query },
            });
            break;

          default:
            toast("Gagal mengecek sertifikat", {
              type: "error",
              toastId: "error",
              position: "top-center",
            });
            break;
        }
      });
  };

  useEffect(() => {
    if (!router.isReady) return;
    getRegisteredCertificate();
  }, [router.isReady]);

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const body: TConfirmCertificateRequestData = {
      company_id: company_id as string,
      serial_number: certificate.serialNumber,
    };
    RestConfirmCertificate(body)
      .then((res) => {
        if (res.success) {
          toast(`Sukses mengaktifkan sertifikat`, {
            type: "success",
            position: "top-center",
            autoClose: 3000,
          });
          setTimeout(() => {
            router.replace({
              pathname: handleRoute("setting-signature-and-mfa"),
              query: { ...router.query },
            });
          }, 1000);
        } else {
          toast(`${res.message}`, {
            type: "error",
            toastId: "error",
            position: "top-center",
          });
        }
      })
      .catch((err) => {
        switch (err.response.status) {
          case 401:
            // unauthorized
            router.replace({
              pathname: handleRoute("login"),
              query: { ...router.query },
            });
            break;

          default:
            toast("Gagal mengecek sertifikat", {
              type: "error",
              toastId: "error",
              position: "top-center",
            });
            break;
        }
      });
  };
  return (
    <div
      className="h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string, "BG"
        ),
      }}
    >
      <div className="p-4 poppins-regular max-w-md mx-auto">
        <div className="flex justify-center">
          <img src="images/certInfo.svg" alt="ill" />
        </div>
        <p className="text-sm text-neutral800">{t("certificateSubtitle")}</p>
        <div className="mt-5">
          <div className="flex items-center">
            <p className="text-sm text-neutral800 font-normal w-24 pr-2">
              {t("country")}
            </p>
            <p className="text-sm text-neutral800 font-medium">
              {certificate.negara}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-neutral800 font-normal w-24 pr-2">
              {t("name")}
            </p>
            <p className="text-sm text-neutral800 font-medium">
              {certificate.nama}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-neutral800 font-normal w-24 pr-2">
              {t("organization")}
            </p>
            <p className="text-sm text-neutral800 font-medium">
              {certificate.organisasi}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-neutral800 font-normal w-24 pr-2">
              Email
            </p>
            <p className="text-sm text-neutral800 font-medium">
              {certificate.emailAddress}
            </p>
          </div>
        </div>
        {i18n.language == "en" ? (
          <p className="text-xs text-neutral800 mt-4 font-normal text-justify">
            <span className="font-semibold">
              If there is no complaint filed within nine days,
            </span>{" "}
            user is deemed to have accepted that all the information in the
            certificate is correct.
          </p>
        ) : (
          <p className="text-xs text-neutral800 mt-4 font-normal text-justify">
            Apabila dalam jangka waktu{" "}
            <span className="font-semibold">
              sembilan hari kalender tidak ada keluhan,
            </span>{" "}
            maka pelanggan dianggap telah menerima bahwa semua informasi yang
            terdapat dalam sertifikat adalah benar.
          </p>
        )}
        <Button
          size="none"
          onClick={(e) => handleConfirm(e)}
          className="mt-8 p-2.5 uppercase text-base font-medium block mx-auto w-48"
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.buttonColor as string
            ),
          }}
        >
          {t("confirmCertif")}
        </Button>
        <div className="w-full flex justify-center">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://cantikatnt.atlassian.net/servicedesk/customer/portal/2/group/8/create/27"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
              ),
              borderColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.buttonColor as string
              ),
              paddingLeft: 0,
              paddingRight: 0,
            }}
            className={buttonVariants({
              size:"none",
              className:
                "border mt-3 py-2.5 uppercase text-base font-medium block mx-auto w-48",
            })}
          >
            {t("complain")}
          </a>
        </div>
        <Footer />
      </div>
    </div>
  );
}

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

export default CertificateInformation;
