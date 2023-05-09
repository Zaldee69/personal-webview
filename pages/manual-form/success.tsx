import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { buttonVariants } from "@/components/atoms/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Footer from "@/components/Footer";

type Props = {};

const FormSuccess = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  return (
    <div  style={{
      backgroundColor: themeConfigurationAvaliabilityChecker(
        themeConfiguration?.data.background as string, "BG"
      ),
    }} className="px-10 pt-16 pb-9 text-center">
      <p className="text-base poppins-semibold text-neutral800">
        {t("livenessSuccessTitle")}
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/livenessSucc.svg`}
          width="196px"
          height="194px"
          alt="liveness-success-ill"
        />
      </div>
      <div className="mt-14">
        <p className="poppins-regular text-xs text-neutral200">
          {t("livenessSuccessSubtitle")}
        </p>
      </div>
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
      <Footer />
    </div>
  );
};

export default FormSuccess;
