import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {};

const LinkAccountSuccess = (props: Props) => {
  return (
    <div className="px-10 pt-16 pb-9 text-center">
      <p className="font-poppins text-base font-semibold text-neutral800">
        Penautan Akun Berhasil!
      </p>
      <div className="mt-20">
        <Image
          src="/images/linkAccountSuccess.svg"
          width="196px"
          height="196px"
        />
      </div>
      <div className="mt-14">
        <p className="font-poppins text-xs text-neutral200">
          Akun Tilaka Anda telah berhasil ditautkan.
        </p>
      </div>
      <div className="mt-20 text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
        <Link href="/">
          <a>Kembali ke Halaman Utama</a>
        </Link>
      </div>
      <div className="mt-11 flex justify-center">
        <Image
          src="/images/poweredByTilaka.svg"
          alt="powered-by-tilaka"
          width="80px"
          height="41.27px"
        />
      </div>
    </div>
  );
};

export default LinkAccountSuccess;
