import React from "react";
import Webcam from "react-webcam";

interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

const FRCamera = () => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <Webcam
      style={{height: "350px", objectFit: "cover"}}
      className="mt-4 rounded-md sm:w-full md:w-full"
      audio={false}
      height={720}
      screenshotFormat="image/jpeg"
      width={1280}
      videoConstraints={constraint}
    />
  );
};

export default FRCamera;
