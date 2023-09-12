import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import useGenerateRedirectUrl from "@/hooks/useGenerateRedirectUrl";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { IParameterFromRequestSign } from "./authhash";
import i18n from "i18";
import { useEffect } from "react";

export const SigningFailure = () => {
    const router = useRouter();
    const routerQuery: NextParsedUrlQuery & {
      redirect_url?: string;
    } & IParameterFromRequestSign = router.query;
  
    const themeConfiguration = useSelector((state: RootState) => state.theme);
  
    const {redirect_url} = routerQuery
  
    const params = {
      ...routerQuery,
    };
  
    delete params["redirect_url"];
  
    const { t }: any = i18n;
  
    const { generatedUrl, autoRedirect } = useGenerateRedirectUrl({
      params,
      url: redirect_url as string,
    });
  
    useEffect(() => {
      autoRedirect()
    }, []);
  
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
          <Heading>{t("signFailed")}</Heading>
          <div
            className="bg-contain mx-auto w-52 h-52 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data.asset_signing_failed as string,
                "ASSET",
                `${assetPrefix}/images/signingFailure.svg`
              )})`,
            }}
          ></div>
          <div className="mt-3">
            <Paragraph size="sm">{t("signFailedSubtitle")} </Paragraph>
          </div>
        </div>
        <div className="mt-32">
          {routerQuery.redirect_url && (
            <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
              <a
                href={generatedUrl}
              >
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
            </div>
          )}
          <Footer />
        </div>
      </div>
    );
  };

  export default SigningFailure