import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Footer from "../../components/Footer";

const LivenessFail = () => {
  return (
    <>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-20 items-center justify-center">
          <h1 className="text-center font-poppins text-xl font-semibold">
            Liveness Gagal
          </h1>
          <Image src="/images/livenessFail.svg" width={200} height={200} />
          <div className="flex flex-col gap-10 ">
            <span className="text-center font-poppins text-neutral ">
              {/* Jika liveness gagal 3x 
              Mohon mengisi Formulir" yang dikirim ke email 
              blabla@yopmail.com
              untuk melanjutkan proses aktivasi akun
             */}
              {/* Jika liveness gagal !== 3x */}
              Maaf, proses Liveness Anda gagal. Foto dan aksi yang diminta tidak
              sesuai. Mohon ulangi proses Liveness dan ikuti petunjuk dengan
              benar.
            </span>
            <Link href="/guide">
              {/* Jika gagal !== 3x */}
              <button className="bg-primary btn md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-9">
                ULANGI
              </button>
              {/* Jika gagal === 3x  
            <span  className="text-center font-semibold font-poppins underline-offset-1	underline  text-primary" >Kembali ke Halaman Utama</span>
            */}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LivenessFail;
