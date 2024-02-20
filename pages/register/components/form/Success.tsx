import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import i18n from "i18";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { buttonVariants } from "@/components/atoms/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";
import { assetPrefix } from "next.config";

const FormSuccess = () => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const { request_id, reason_code, status, redirect_url } = routerQuery;

  const params = {
    request_id: request_id,
    register_id: request_id,
    reason_code,
    status,
  };

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: redirect_url as string,
  });

  useEffect(() => {
    autoRedirect();
  }, []);

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 min-h-screen pt-16 pb-9 text-center"
    >
      <Heading>{t("livenessSuccessTitle")}</Heading>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/livenessSucc.svg`}
          width="196"
          height="194"
          alt="liveness-success-ill"
        />
      </div>
      <div className="mt-14">
        <Paragraph size="sm">{t("livenessSuccessSubtitle")}</Paragraph>
      </div>
      <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
        {routerQuery.redirect_url && (
          <a
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
            className={buttonVariants({
              variant: "link",
              size: "none",
              className: "font-semibold",
            })}
            href={generatedUrl}
          >
            {t("livenessSuccessButtonTitle")}
          </a>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FormSuccess;
