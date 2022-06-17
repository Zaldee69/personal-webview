import Link from "next/link";
import { useRouter } from 'next/router'
import Footer from "../../components/Footer";
import Head from "next/head";

const Guide = () => {
  const router = useRouter()
  const routerQuery = router.query

  return (
    <>
      <Head>
        <title>Panduan Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto ">
        <h2 className="font-poppins text-xl font-semibold" >Liveness</h2>
        <span className="font-poppins text-sm block mt-4">
          Mohon perhatikan hal-hal berikut saat pengambilan wajah untuk
          penilaian yang maksimal.
        </span>
        <div className="flex flex-row justify-center mt-10 gap-5">
          <div className="flex flex-col items-center space-y-4">
            <img
              alt="guide-1"
              src="/images/Liveness.svg"
              width={150}
              height={120}
            />
            <img
              alt="right-guide"
              src="/images/right.svg"
              width={30}
              height={30}
            />
          </div>
          <div className="flex flex-col items-center space-y-4">
            <img
              alt="guide-2"
              src="/images/guide1.svg"
              width={150}
              height={120}
            />
            <img
              alt="wrong-guide"
              src="/images/wrong.svg"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div>
          <ul className="list-disc flex flex-col font-poppins text-sm gap-4 my-10 px-5">
            <li>Wajah menghadap kamera dengan latar belakang yang jelas.</li>
            <li>
              Lepaskan atribut seperti kacamata, topi dan masker, serta rambut
              tidak menutupi wajah.
            </li>
            <li>
              Pastikan pencahayaan baik, tidak terlalu terang atau terlalu
              gelap.
            </li>
          </ul>
        </div>
        <Link href={`/liveness?registerId=${routerQuery.registerId}`}>
          <button className="bg-primary btn md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-9 ">
            MULAI
          </button>
        </Link>
        <Footer />
      </div>
    </>
  );
};

export default Guide;
