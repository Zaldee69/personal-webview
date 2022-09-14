import Camera from "@/components/Camera";
import Footer from "@/components/Footer";
import ProgressStepBar from "@/components/ProgressStepBar";
import Head from "next/head";
import Image from "next/image";
import { Fragment, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { assetPrefix } from "next.config";

const ReEnrollMekari = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isStepDone, setStepDone] = useState<boolean>(false)
  const [isCameraLoaded, setIsCameraLoaded] = useState<boolean>(true)

  const router = useRouter();
  const routerQuery = router.query;
  const subTtile: string =
    routerQuery.status === "done"
      ? "Terima kasih telah mengikuti proses Liveness. Hasil dinilai berdasarkan keaslian serta kesesuaian foto dengan aksi yang diminta."
      : "Pastikan wajah di dalam garis panduan dan ikuti petunjuk dengan benar";

  return (
    <Fragment>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-10 max-w-sm mx-auto px-2">
        <h1 className="font-poppins font-semibold mb-3 ">Liveness</h1>
        <span className="font-poppins text-sm ">{subTtile}</span>
        {routerQuery.status === "done" ? (
          <div className="mt-10 rounded-md h-[250px] flex justify-center items-center sm:w-full md:w-full">
            <Loading title="Please Wait" />
          </div>
        ) : (
          <Camera
          currentActionIndex={currentActionIndex}
          setCurrentActionIndex={setCurrentActionIndex}
          currentStep="Liveness Detection"
          setFailedMessage={setFailedMessage}
          progress={progress}
          setProgress={setProgress}
          isCameraLoaded={isCameraLoaded}
          setIsCameraLoaded={setIsCameraLoaded}
          />
        )}
        <div className="mt-5 flex justify-center">
          {routerQuery.status !== "done" && (
            <Image
              src={`${assetPrefix}/images/hadap-depan.svg`}
              width={50}
              height={50}
              alt="action"
            />
          )}
          {/* {
            actionList.length === 2 && (
              <Image src={`${assetPrefix}/images/${currentIndex}.svg`} width={50} height={50} />
            )
          } */}
        </div>
        <div className="flex items-center justify-center mt-5 flex-col">
          <span
            className={`font-poppins font-medium ${
              routerQuery.status === "done" ? "hidden" : null
            }`}
          >
            {/* {actionText(actionList)} */}
            Menghadap Ke Depan
          </span>
          {failedMessage ? (
            <span className="text-center font-poppins text-sm mt-7 text-red300">
              {failedMessage}
            </span>
          ) : (
            <span
              className={`text-center font-poppins text-sm mt-7 text-neutral ${
                routerQuery.status === "done" ? "hidden" : null
              }`}
            >
              Mohon jangan bergerak selama proses pengambilan wajah
            </span>
          )}
        </div>
        <ProgressStepBar
          actionList={["mouth_open", "blink"]}
          currentActionIndex={currentActionIndex}
        />
        <Footer />
      </div>
    </Fragment>
  );
};

export default ReEnrollMekari;
