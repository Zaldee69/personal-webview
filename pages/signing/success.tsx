import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import i18n from "i18";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { IParameterFromRequestSign } from "./authhash";

export const SigningSuccess = () => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
    status?: string;
  } & IParameterFromRequestSign = router.query;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const params = {
    ...routerQuery,
  };

  delete params["redirect_url"];

  const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
    params,
    url: router.query.redirect_url as string,
  });

  useEffect(() => {
    autoRedirect()
  }, []);

  const { t }: any = i18n;

  return (
    <div
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
      className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen"
    >
      <div>
        <Heading>{t("authenticationSuccessTitle")}</Heading>
        <div
          className="bg-contain mx-auto w-52 h-52 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_signing_success as string,
              "ASSET",
              `${assetPrefix}/images/signingSuccess.svg`
            )})`,
          }}
        ></div>
        <div className="mt-3">
          <Paragraph size="sm" className="whitespace-pre-line">
            {t("authenticationSuccessSubtitle")}
          </Paragraph>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <a href={generatedUrl}>
            <span
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string
                ),
              }}
              className={buttonVariants({
                variant: "link",
                size: "none",
                className: "font-medium",
              })}
            >
              {t("livenessSuccessButtonTitle")}
            </span>
          </a>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default SigningSuccess;
