import Image from "next/image";
import Link from "next/link";
import React from "react";
import Footer from "../../components/Footer";

const Index = () => {
  return (
    <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto ">
      <span className="font-poppins text-sm mt-5">
        Mohon perhatikan hal-hal berikut saat pengambilan wajah untuk penilaian
        yang maksimal.
      </span>
      <div className="flex flex-row justify-center mt-10 gap-5">
        <div className="flex flex-col ">
          <Image src="/images/guide.svg" width={150} height={120} />
          <Image src="/images/right.svg" width={30} height={30} />
        </div>
        <div className="flex flex-col ">
          <Image src="/images/guide1.svg" width={150} height={120} />
          <Image src="/images/wrong.svg" width={30} height={30} />
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
            Pastikan pencahayaan baik, tidak terlalu terang atau terlalu gelap.
          </li>
        </ul>
      </div>
      <Link href="/liveness">
        <button className="bg-primary btn md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-9 ">
          MULAI
        </button>
      </Link>
      <Footer />
    </div>
  );
};

export default Index;
