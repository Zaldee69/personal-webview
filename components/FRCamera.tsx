import React, { useRef, useState, useEffect, useCallback } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Webcam from "react-webcam";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import i18n from "i18";
import useCameraPermission, {
  TPermissionState,
} from "@/hooks/useCameraPermission";

interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

interface Props {
  callbackCaptureProcessor: (base64Img: string | null | undefined) => void;
  setIsUserMediaError: React.Dispatch<React.SetStateAction<boolean>>;
}

const FRCamera = ({ callbackCaptureProcessor, setIsUserMediaError }: Props) => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const cameraPermission: TPermissionState = useCameraPermission();

  const [isPlaying, setIsPlaying] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);

  const onPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const capture = useCallback(async () => {
    toast(t("loadingTitle"), {
      type: "info",
      toastId: "info",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });

    const imageSrc = webcamRef?.current?.getScreenshot();
    callbackCaptureProcessor(imageSrc);
  }, []);

  useEffect(() => {
    if (cameraPermission === "denied") setIsUserMediaError(true);
  }, [cameraPermission]);

  return (
    <div className="relative">
      <div
        id="countdown-timer-fr"
        className="absolute text-white right-3 top-3"
      >
        <CountdownCircleTimer
          onComplete={() => {
            capture();
            return {
              shouldRepeat: false,
            };
          }}
          isPlaying={isPlaying}
          size={45}
          strokeWidth={4}
          duration={5}
          colors="#fff"
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
        onLoadedMetadata={onPlay}
        onUserMediaError={() => setIsUserMediaError(true)}
      />
    </div>
  );
};

export default FRCamera;
