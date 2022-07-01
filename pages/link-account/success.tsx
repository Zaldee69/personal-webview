import { assetPrefix } from "../../next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

type Props = {};

const LinkAccountSuccess = (props: Props) => {
  const router = useRouter();
  const routerIsReady: boolean = router.isReady;
  const routerQuery: NextParsedUrlQuery & { signing?: "1" } = router.query;
  const isSigning: boolean = routerQuery.signing === "1";
  const REDIRECT_URL = "http://10.117.1.103:9080/"

  useEffect(() => {
    if (!routerIsReady) return;
    if (!isSigning) return;
    setTimeout(() => {
      router.replace({
        pathname: "/signing",
        query: { ...routerQuery },
      });
    }, 1000);
  }, [isSigning]);

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
      {!isSigning && (
        <div className="mt-20 text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
          <Link href={process.env.NEXT_REDIRECT_API_URL || REDIRECT_URL}>
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
