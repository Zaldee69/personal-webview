import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../next.config";
import i18n from "i18";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { buttonVariants } from "@/components/atoms/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

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
    }} className="px-10 min-h-screen pt-16 pb-9 text-center">
      <Heading>
        {t("livenessSuccessTitle")}
      </Heading>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/livenessSucc.svg`}
          width="196"
          height="194"
          alt="liveness-success-ill"
        />
      </div>
      <div className="mt-14">
        <Paragraph size="sm" >
          {t("livenessSuccessSubtitle")}
        </Paragraph>
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
