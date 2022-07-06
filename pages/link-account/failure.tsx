import { handleRoute } from "@/utils/handleRoute";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { assetPrefix } from "../../next.config";

type Props = {};

const LinkAccountFailure = (props: Props) => {
  const router = useRouter();
  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="font-poppins text-base font-semibold text-neutral800">
        Penautan Akun Gagal
      </p>
      <div className="mt-20">
        <Image
          src={`${assetPrefix}/images/linkAccountFailure.svg`}
          width="196px"
          height="196px"
        />
      </div>
      <div className="mt-14">
        <p className="font-poppins text-xs text-neutral200">
          Pastikan data sesuai dengan akun Tilaka yang akan ditautkan.
        </p>
      </div>
      <div className="mt-20 text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
        <Link
          href={{
            pathname: handleRoute("/link-account"),
            query: { ...router.query },
          }}
        >
          <a>Tautkan Akun Tilaka</a>
        </Link>
      </div>
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

export default LinkAccountFailure;
