import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";
import { assetPrefix } from '../../next.config'
import { AppDispatch } from "@/redux/app/store";
import { useDispatch } from "react-redux";
import { setIsDone } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";

const LivenessFail = () => {
  const router = useRouter()
  const [gagalCounter, setGagalCounter] = useState(0)
  const dispatch: AppDispatch = useDispatch();


  const resetStorage = () => {
    setGagalCounter(0)
    sessionStorage.removeItem('tlk-counter')
  }

  useEffect(() => {
    dispatch(setIsDone(false))
    if (sessionStorage.getItem('tlk-counter')) {
      setGagalCounter(parseInt(sessionStorage.getItem('tlk-counter') as string))
    }
  }, [])

  const RedirectButton = () => {
    if (gagalCounter > 2) {
      return (
        <span onClick={resetStorage} className="text-center font-semibold font-poppins underline-offset-1	underline  text-primary" >Kembali ke Halaman Utama</span>
      )
    } else {
      return (
        <Link href={handleRoute(`/guide?registerId=${router.query.registerId}`)}>
          <button className="bg-primary btn md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-9">
            ULANGI
          </button>
        </Link>
      )
    }
  }
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
          <Image src={`${assetPrefix}/images/livenessFail.svg`} width={200} height={200} />
          <div className="flex flex-col gap-10 ">
            <span className="text-center font-poppins text-neutral ">
              {
                gagalCounter > 2 ? 'Mohon mengisi Formulir yang dikirim ke email Anda untuk melanjutkan proses aktivasi akun' : 'Maaf, proses Liveness Anda gagal. Foto dan aksi yang diminta tidak sesuai. Mohon ulangi proses Liveness dan ikuti petunjuk dengan benar.'
              }
            </span>
          </div>
          <RedirectButton />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LivenessFail;
