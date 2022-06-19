import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Footer from "../../components/Footer";

const LivenessFailure = () => {
  return (
    <>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-20 items-center justify-center">
          <h1 className="text-center text-neutral800 font-poppins text-xl font-semibold">
            Liveness Gagal
          </h1>
          <Image src="/images/livenessFail.svg" width={200} height={200} />
          <div className="flex flex-col gap-10 ">
            <p className="text-center font-poppins  text-neutral ">
              Mohon mengisi Formulir yang dikirim ke email
              <span className="block font font-medium text-neutral800">
                blabla@yopmail.com
              </span>{" "}
              untuk melanjutkan proses aktivasi akun
            </p>
            <Link href="/">
              <span className="text-center font-semibold font-poppins underline-offset-1	underline  text-primary">
                Kembali ke Halaman Utama
              </span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LivenessFailure;
