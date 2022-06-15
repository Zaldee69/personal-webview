import Webcam from "react-webcam";
import CircularProgressBar from "./CircularProgressBar";


interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

const Camera: React.FC = () => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
      <div className="relative">
        <Webcam
          style={{height: "350px", objectFit: "cover"}}
          className="mt-10 rounded-md sm:w-full md:w-full"
          audio={false}
          height={720}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={constraint}
        />
        <div className="circle-container">
          <CircularProgressBar />
        </div>
      </div>
      
  );
};

export default Camera;
