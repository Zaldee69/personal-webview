import { assetPrefix } from "../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { handleRoute } from "@/utils/handleRoute";

type Props = {};

const LinkAccountSuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    signing?: "0";
    redirect_url?: string;
  } = router.query;
  const isNotSigning: boolean = routerQuery.signing === "0";

  useEffect(() => {
    if (!routerIsReady) return;
    if (isNotSigning) return;
    setTimeout(() => {
      router.replace({
        pathname: handleRoute("/signing"),
        query: { ...routerQuery },
      });
    }, 1000);
  }, [isNotSigning]);

  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="font-poppins text-base font-semibold text-neutral800">
        Penautan Akun Berhasil!
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/linkAccountSuccess.svg`}
          width="196px"
          height="196px"
        />
      </div>
      <div className="mt-14">
        <p className="font-poppins text-xs text-neutral200">
          Akun Tilaka Anda telah berhasil ditautkan.
        </p>
      </div>
      {isNotSigning && routerQuery.redirect_url && (
        <div className="mt-20 text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
          <Link href={routerQuery.redirect_url}>
            <a>Kembali ke Halaman Utama</a>
          </Link>
        </div>
      )}
      <div className="mt-11 flex justify-center">
        <Image
          src={`${assetPrefix}/images/poweredByTilaka.svg`}
          alt="powered-by-tilaka"
          width="80px"
          height="41.27px"
        />
      </div>
    </div>
  );
};

export default LinkAccountSuccess;
