import Footer from "@/components/Footer";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import { assetPrefix } from "next.config";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

const Index = () => {
  const router = useRouter();
  const routerQuery = router.query;
  const { t }: any = i18n;

  return (
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
          Pendaftaran Anda sedang dalam proses verifikasi. Mohon periksa email
          Anda secara berkala dalam 1x24 jam.
        </p>
        <div className="mt-20 text-primary text-base poppins-medium underline hover:cursor-pointer">
          {routerQuery.redirect_url && (
            <a
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
      <Footer/>
    </div>
  );
};

export default Index;
