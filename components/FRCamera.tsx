import React, { useRef, useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Webcam from "react-webcam";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import { restSigning } from "infrastructure/rest/signing";
import { restLogout } from "infrastructure/rest/b2b";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { handleRoute } from './../utils/handleRoute';

interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

interface Props {
  setIsFRSuccess: React.Dispatch<React.SetStateAction<boolean>>
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

let dom: any;

const FRCamera = ({setIsFRSuccess, setModal} : Props) => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const document = useSelector((state: RootState) => state.document);
  const signature = useSelector((state: RootState) => state.signature);

  const router = useRouter();

  const [successState, setIsSuccessState] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);

  const checkCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = [];
      Object.keys(devices).forEach((key: any) => {
        if (devices[key].kind === "videoinput") {
          videoInputs.push(devices[key]);
        }
      });

      if (videoInputs.length === 0) {
        setIsSuccessState(false);
      } else {
        dom = {
          // grab instances of dom objects so we dont have to look them up later
          video: webcamRef.current?.video,
          canvas: null,
        };
      }
    } catch (_) {
      setIsSuccessState(false);
    }
  };

  const onPlay = () => {
    setIsPlaying(true);
  };
  const count = parseInt(localStorage.getItem("count" ) as string) 
  localStorage.setItem("count", count ? count.toString() : "0")


  const capture = React.useCallback(() => {
    toast(`Mencocokkan wajah...`, {
      type: "info",
      toastId: "info",
      isLoading: true,
      position: "top-center",
    });
    const imageSrc = webcamRef?.current?.getScreenshot()
    restSigning({
      payload: {
        file_name: new Date().getTime().toString(),
        otp_pin: "",
        content_pdf: document.response.data.document,
        width: document.response.data.width,
        height: document.response.data.height,
        face_image: imageSrc?.split(",")[1] as string,
        coordinate_x: document.response.data.posX,
        coordinate_y: document.response.data.posY,
        signature_image: signature.data.font || signature.data.scratch || document.response.data.tandaTangan,
        page_number: document.response.data.page_number,
        qr_content: "",
        tilakey: "",
        company_id: "",
        api_id: "",
        trx_id: router.query.transaction_id as string,
      },
    }).then((res) => {
      if(res.success){
        localStorage.setItem("count", "0")
        toast.dismiss("info")
        toast(`Pencocokan berhasil`, {
          type: "success",
          position: "top-center",
        });
        setIsFRSuccess(true)
      }else if(!res.success) {
        toast.dismiss("info")
        toast.error(res.message, { icon: <XIcon /> });
        setModal(false)
      }
    }).catch((err) => {
      if(err.request.status === 401){
        router.replace({
          pathname: handleRoute("/login"),
          query: { ...router.query },
        });
      }else {
        setModal(false)
        setTimeout(() => {
        setModal(true)
        },100)
        toast.dismiss("info")
        toast.error("Wajah tidak cocok", { icon: <XIcon /> });
        const newCount = parseInt(localStorage.getItem("count" ) as string) + 1
        localStorage.setItem("count", newCount.toString())
        const count = parseInt(localStorage.getItem("count" ) as string)
        setModal(false)
        if(count >= 5){
          localStorage.removeItem("token")
          localStorage.setItem("count", "0")
          restLogout()
          router.replace({
            pathname: handleRoute("/login"),
            query: { ...router.query },
          });
        }
      }
    })
  }, [webcamRef]);

  useEffect(() => {
    checkCamera();
  });

  return (
    <div className="relative">
      <div className="absolute text-white right-3 top-3">
        <CountdownCircleTimer
          onComplete={() => {
            capture()
            return {shouldRepeat: true, delay: 15}
          }}
          isPlaying={isPlaying}
          size={45}
          strokeWidth={4}
          duration={5}
          colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]}
          colorsTime={[7, 5, 2, 0]}
        >
          {({ remainingTime }) => remainingTime + "s"}
        </CountdownCircleTimer>
      </div>
      <Webcam
        style={{ height: "280px", objectFit: "cover" }}
        className="mt-4 rounded-md sm:w-full md:w-full"
        ref={webcamRef}
        audio={false}
        height={960}
        screenshotFormat="image/jpeg"
        width={1280}
        screenshotQuality={1}
        minScreenshotWidth={1280}
        mirrored={false}
        minScreenshotHeight={960}
        videoConstraints={constraint}
        onLoadedMetadata={(e) => onPlay()}
      />
    </div>
  );
};

export default FRCamera;
