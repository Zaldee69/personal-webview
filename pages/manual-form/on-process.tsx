import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/atoms/Button";
import { RootState } from "@/redux/app/store";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import i18n from "i18";
import { assetPrefix } from "next.config";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";

const Index = () => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return (
    <div className="h-screen" style={{
      backgroundColor: themeConfigurationAvaliabilityChecker(
        themeConfiguration?.data.background as string, "BG"
      ),
    }} >
      <div className="px-5 pt-8 max-w-md poppins-regular mx-auto text-center">
        <div>
          <h1 className="text-lg font-bold mb-14 ">Pendaftaran Dalam Proses</h1>
          <Image
            src={`${assetPrefix}/images/waiting.svg`}
            width="196px"
            height="194px"
            alt="liveness-success-ill"
          />
          <p className="text-md text-neutral200 mt-14">
            {t("registrationInProcessSubtitle")}
          </p>
          <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
            {routerQuery.redirect_url && (
              <a
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.actionFontColor as string
                  ),
                }}
                className={buttonVariants({
                  variant: "link",
                  size: "none",
                  className: "font-semibold",
                })}
                href={concateRedirectUrlParams(
                  routerQuery.redirect_url as string,
                  ""
                )}
              >
                {t("livenessSuccessButtonTitle")}
              </a>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
