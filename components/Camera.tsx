import Webcam from "react-webcam";
import React, { Dispatch, SetStateAction } from 'react'
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assetPrefix } from '../next.config'
import { AppDispatch, RootState } from "@/redux/app/store";
import CircularProgressBar from "./CircularProgressBar";
import { setImages, setIsDone } from "@/redux/slices/livenessSlice";
import openMouthHandler from "@/utils/openMouthHandler";
import blinkHandler from "@/utils/blinkHandler";
import lookLeftHandler from "@/utils/lookLeftHandler";
import lookRightHandler from "@/utils/lookRightHandler";
import lookUpHandler from "@/utils/lookUpHandler";
import lookDownHandler from "@/utils/lookDownHandler";


let result: any;
let dom: any;
let isDone: any;
let human: any = undefined;
let count : number = 1

interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

interface Props {
  currentStep: string
  currentActionIndex: number
  progress: number
  isCameraLoaded: boolean
  setProgress: Dispatch<SetStateAction<number>>
  setCurrentActionIndex: Dispatch<SetStateAction<number>>
  setFailedMessage:  Dispatch<SetStateAction<string>>
  setIsCameraLoaded:  Dispatch<SetStateAction<boolean>>
}

const Camera: React.FC<Props> = ({
  currentStep,
  currentActionIndex,
  setCurrentActionIndex,
  setFailedMessage, 
  progress,
  setProgress,
  isCameraLoaded,
  setIsCameraLoaded

}) => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const _isMounted = useRef(true);


  const actionList = useSelector((state: RootState) => state.liveness.actionList);


  const [currentActionState, setCurrentActionState] = useState('look_straight');
  const [isCurrentStepDone, setIsCurrentStepDone] = useState(false);
  const [successState, setIsSuccessState] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [image, setImage] = useState("");
  const [percent, setPercent] = useState<number>(0)
  const dispatch: AppDispatch = useDispatch();
  


  const isIndexDone = async (i: any) => {
    return isDone[i];
  }
  const setIndexDone = async (i: any) => {
    isDone[i] = true;
  }

  useEffect(() => {
    if (_isMounted) {
      checkCamera();
    }
  }, []);

  const wrongActionSetter = (error: boolean, message: string) => {
    setFailedMessage(message)
    setError(error)
  }

  const progressSetter = (number: number) => {
    setPercent(number)
    setProgress(number)
  }


  useEffect(() => {
    const initHuman = async () => {
      const humanConfig = { // user configuration for human, used to fine-tune behavior
        // backend: 'webgl',
        // async: true,
        modelBasePath: assetPrefix ? `${assetPrefix}/models` : '/models',
        filter: { enabled: false, equalization: false },
        face: { enabled: true, detector: { rotation: true }, mesh: { enabled: true }, iris: { enabled: true }, description: { enabled: true }, emotion: { enabled: false } },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: false },
        gesture: { enabled: true },
      };
      const { Human } = await import("@vladmandic/human/dist/human.esm.js");
      human = new Human(humanConfig); // create instance of human with overrides from user configuration
      human.env['perfadd'] = false; // is performance data showing instant or total values
      human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
      human.draw.options.lineHeight = 20;
    }
    initHuman();
  });

  async function detectionLoop() { // main detection loop
    if (human != undefined) {
      result = await human.detect(dom.video); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
      requestAnimationFrame(detectionLoop); // start new frame immediately
    }
  }

  async function drawLoop() { // main screen refresh loop
    let clicked = false;
    if (result) {
      const interpolated = await human.next(result);
      const progressCircleClass: any = document.querySelector(".progress-circle");
      const progressCircleLength: number = progressCircleClass?.style?.strokeDashoffset
      const capture =  captureButtonRef.current

      if ((interpolated.face.length > 0) && (interpolated.face[0].rotation != undefined) && (capture != null)) {
        const roll = interpolated.face[0].rotation.angle.roll * (180 / Math.PI);
        const yaw = interpolated.face[0].rotation.angle.yaw * (180 / Math.PI);
        const pitch = interpolated.face[0].rotation.angle.pitch * (180 / Math.PI);
        const distance = interpolated.face[0].iris;
        let blink_left_eye : boolean = false;
        let blink_right_eye : boolean = false;
        let mouth_score : number = 0;
        let look_left : boolean = false;
        let look_right : boolean = false;
        let look_center : boolean = false;
        interpolated.gesture.forEach((item : any) => {
          if (item.gesture == "blink left eye") {
            blink_left_eye = true;
          } else if (item.gesture == "blink right eye") {
            blink_right_eye = true;
          } else if (item.gesture.substring(0,5) == "mouth") {
            const mouth = item.gesture.split(" ", 3);
            mouth_score = parseFloat(mouth[1])/100;
          } else if (item.gesture == "facing left") {
            look_left = true;
          } else if (item.gesture == "facing right") {
            look_right = true;
          } else if (item.gesture == "facing center") {
            look_center = true;
          }
        });
        if (actionList[currentActionIndex] == "look_straight") {
          if(look_center && distance < 25){
            if (roll > -10 && roll < 10 && distance < 25) {
              if (yaw > -10 && yaw < 10 && distance < 25) {
                if (pitch > -10 && pitch < 10 && distance < 25) {
                  let done = await isIndexDone(currentActionIndex);
                  if (!done) {
                    await setIndexDone(currentActionIndex);
                    capture.click();
                    clicked = true;
                    progressSetter(100)
                  }
                }
              }
            }
          }
        } else if (actionList[currentActionIndex] == "look_left") {
          progressSetter(0)
          lookLeftHandler({look_left, distance, roll, progressSetter, capture, clicked, currentActionIndex, isIndexDone, setIndexDone, wrongActionSetter})
        } else if (actionList[currentActionIndex] == "look_right") {
          progressSetter(0)
          lookRightHandler({look_right, distance, roll, progressSetter, capture, clicked, currentActionIndex, isIndexDone, setIndexDone, wrongActionSetter})
        } else if (actionList[currentActionIndex] == "look_up") {
          progressSetter(0)
          lookUpHandler({distance, roll, yaw, pitch, progressSetter, capture, clicked, currentActionIndex, isIndexDone, setIndexDone, wrongActionSetter})
        } else if (actionList[currentActionIndex] == "look_down") {
          progressSetter(0)
          lookDownHandler({distance, roll, yaw, pitch, progressSetter, capture, clicked, currentActionIndex, isIndexDone, setIndexDone, wrongActionSetter})
        } else if (actionList[currentActionIndex] == "mouth_open") {
          progressSetter(0)
          Math.round(progressCircleLength) < 5 && count < 33 ? count++ : count
          openMouthHandler({mouth_score, wrongActionSetter, progressSetter, count, isIndexDone, setIndexDone, currentActionIndex, clicked, capture})
        } else if (actionList[currentActionIndex] == "blink") {
          progressSetter(0)
          Math.round(progressCircleLength) < 5 && count < 35 ? count++ : count
          blinkHandler({blink_left_eye,blink_right_eye, wrongActionSetter, progressSetter, count, isIndexDone, setIndexDone, currentActionIndex, clicked, capture})
        } 
      }
    }
    if (clicked) {
      setTimeout(drawLoop, 1000); // Wait for click update
    } else {
      setTimeout(drawLoop, 30); // use to slow down refresh from max refresh rate to target of 30 fps
    }
  }
  

  const onPlay = async () => {
    isDone = new Array(actionList.length);
    for (var i = 0; i < actionList.length; i++) {
      isDone[i] = false;
    }
    await detectionLoop();
    await drawLoop();
    setIsSuccessState(false)
  }

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
        dom = { // grab instances of dom objects so we dont have to look them up later
          video: webcamRef.current?.video,
          canvas: null,
        };
        // setConstraintAfterFlip();
        // if (videoInputs.length > 1) {
        //   setHasMultipleCamera(true);
        // }
      }
    } catch (_) {
      setIsSuccessState(false);
    }
  };

  const setImagesToPool = async () => {
    const image: any = await webcamRef.current?.getScreenshot();
    dispatch(setImages({
      value: image,
      step: currentStep,
      action: currentActionState,
    }))
  };

  const capture = async (e: any) => {
    e.preventDefault();
    await setImagesToPool();
    if (currentStep === "Liveness Detection" || currentStep === "Issue Liveness Detection") {
      setCurrentActionIndex(++currentActionIndex);
      if (currentActionIndex > actionList.length - 1) {
        setCurrentActionState(actionList[actionList.length - 1]);
      } else {
        setCurrentActionState(actionList[currentActionIndex]);
      }
      if (currentActionIndex === actionList.length) {
        setIsCurrentStepDone(true);
        webcamRef.current = null;
        dispatch(setIsDone(true))
        return;
      }
    } else {
      if (image == "") {
        const image: any = await webcamRef?.current?.getScreenshot();
        setImage(image)
        setIsCurrentStepDone(true);
        webcamRef.current = null;
      } else {
        setImage("")
        setIsCurrentStepDone(false);
      }
      return;
    }
  };

  useEffect(() => {
    const progressCircle: any = document.querySelector(".progress-circle");
    progressCircle.style.display = "none"
    setTimeout(() => {
      progressCircle.style.display = "block"
    }, 1500)
  }, [])


  return (
    <div className="relative">
          <Webcam
        style={{ height: "350px", objectFit: "cover" }}
        className="mt-10 rounded-md sm:w-full md:w-full"
        screenshotQuality={1}
        audio={false}
        ref={webcamRef}
        height={720}
        screenshotFormat="image/jpeg"
        width={1280}
        minScreenshotWidth={1280}
        mirrored={false}
        minScreenshotHeight={720}
        onLoadedMetadata={(e) => onPlay()}
        videoConstraints={constraint}
        onUserMedia={() => setIsCameraLoaded(false)}
      />
          <div className={`circle-container`}>
            <CircularProgressBar percent={percent} error={error} />
          </div>
      <button
        ref={captureButtonRef}
        onClick={(e) => capture(e)}
        style={{ display: 'none' }}
      >
      </button>
    </div>


  );
};

export default Camera;
