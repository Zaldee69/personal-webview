import Image from "next/image";
import React from "react";
import Camera from "../../components/Camera";
import Footer from "../../components/Footer";
import ProgressStepBar from "../../components/ProgressStepBar";

const Liveness = () => {
  return (
    <div className="py-10 px-2">
      <span className="font-poppins text-sm ">
        Pastikan wajah di dalam garis panduan dan ikuti petunjuk dengan benar
      </span>
      <Camera />
      <ProgressStepBar />
      <div className="flex items-center justify-center mt-5 flex-col">
        <span className="font-poppins font-medium">
          Wajah menghadap ke depan
        </span>
        <span className="text-center font-poppins text-sm text-neutral">Mohon jangan bergerak selama proses pengambilan wajah</span>
      </div>
      <Footer/>
    </div>
  );
};

export default Liveness;
