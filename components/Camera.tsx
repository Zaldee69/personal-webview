import Webcam from "react-webcam";
import React from 'react'
import { useRef, useEffect, useState } from "react";
import CircularProgressBar from "./CircularProgressBar";

let result: any;
let dom: any;
let isDone: any;
let human: any = undefined;


interface Constraint {
  width: number;
  height: number;
  facingMode: string;
}

interface Props {
  actions: string[],
  currentAction?: string,
  currentStep?: string
}

const Camera: React.FC<Props> = ({
  actions,
  currentAction,
  currentStep,
}) => {
  const constraint: Constraint = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const _isMounted = useRef(true);



  const [actionsState, setactionsState] = useState(actions);
  const [currentActionState, setCurrentActionState] = useState(currentAction);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isCurrentStepDone, setIsCurrentStepDone] = useState(false);
  const [successState, setIsSuccessState] = useState(false);
  const [image, setImage] = useState("");
  const [images, setImages] = useState({});



  const isIndexDone = async (i: any) => {
    return isDone[i];
  }
  const setIndexDone = async (i: any) => {
    isDone[i] = true;
  }

  useEffect(() => {
    if (_isMounted) {
      if (currentStep === "Liveness Detection" || currentStep === "Issue Liveness Detection") {
        setCurrentActionState("Look Straight");
      }

      checkCamera();
    }
  }, []);


  useEffect(() => {
    const initHuman = async () => {
      const humanConfig = { // user configuration for human, used to fine-tune behavior
        // backend: 'webgl',
        // async: true,
        modelBasePath: '/models',
        filter: { enabled: false, equalization: false },
        face: { enabled: true, detector: { rotation: false }, mesh: { enabled: true }, iris: { enabled: false }, description: { enabled: false }, emotion: { enabled: false } },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: false },
        gesture: { enabled: false },
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
      const interpolated = await human.next(result); // smoothen result using last-known results
      //await human.draw.canvas(dom.video, dom.canvas); // draw canvas to screen
      //await human.draw.all(dom.canvas, interpolated); // draw labels, boxes, lines, etc.
      if ((interpolated.face.length > 0) && (interpolated.face[0].rotation != undefined) && (captureButtonRef.current != null)) {
        const roll = interpolated.face[0].rotation.angle.roll * (180 / Math.PI);
        const yaw = interpolated.face[0].rotation.angle.yaw * (180 / Math.PI);
        const pitch = interpolated.face[0].rotation.angle.pitch * (180 / Math.PI);
        if (actionsState[currentActionIndex] == "Look Straight") {
          if ((roll > -10) && (roll < 10)) {
            if ((yaw > -10) && (yaw < 10)) {
              if ((pitch > -10) && (pitch < 10)) {
                let done = await isIndexDone(currentActionIndex);
                if (!done) {
                  await setIndexDone(currentActionIndex);
                  await captureButtonRef.current.click();
                  clicked = true;
                }
              }
            }
          }
        } else if (actionsState[currentActionIndex] == "Look Left") {
          if ((roll > -20) && (roll < 20)) {
            if ((pitch > -20) && (pitch < 20)) {
              if ((yaw < -29) && (yaw > -35)) {
                let done = await isIndexDone(currentActionIndex);
                if (!done) {
                  await setIndexDone(currentActionIndex);
                  ++currentActionIndex;
                  await captureButtonRef.current.click();
                  clicked = true;
                }
              }
            }
          }
        } else if (actionsState[currentActionIndex] == "Look Right") {
          if ((roll > -20) && (roll < 20)) {
            if ((pitch > -20) && (pitch < 20)) {
              if ((yaw > 29) && (yaw < 35)) {
                let done = await isIndexDone(currentActionIndex);
                if (!done) {
                  await setIndexDone(currentActionIndex);
                  ++currentActionIndex;
                  await captureButtonRef.current.click();
                  clicked = true;
                }
              }
            }
          }
        } else if (actionsState[currentActionIndex] == "Look Up") {
          if ((roll > -20) && (roll < 20)) {
            if ((yaw > -20) && (yaw < 20)) {
              if ((pitch < -19) && (pitch > -31)) {
                let done = await isIndexDone(currentActionIndex);
                if (!done) {
                  await setIndexDone(currentActionIndex);
                  ++currentActionIndex;
                  await captureButtonRef.current.click();
                  clicked = true;
                }
              }
            }
          }
        } else if (actionsState[currentActionIndex] == "Look Down") {
          if ((roll > -20) && (roll < 20)) {
            if ((yaw > -20) && (yaw < 20)) {
              if ((pitch > 29) && (pitch < 35)) {
                let done = await isIndexDone(currentActionIndex);
                if (!done) {
                  await setIndexDone(currentActionIndex);
                  ++currentActionIndex;
                  await captureButtonRef.current.click();
                  clicked = true;
                }
              }
            }
          }
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
    console.log(actionsState)
    isDone = new Array(actionsState.length);
    for (var i = 0; i < actionsState.length; i++) {
      isDone[i] = false;
    }
    await detectionLoop();
    await drawLoop();
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
    setImages({
      value: image,
      step: currentStep,
      action: currentActionState,
    })

  };

  const capture = async (e: any) => {
    e.preventDefault();
    await setImagesToPool();
    if (currentStep === "Liveness Detection" || currentStep === "Issue Liveness Detection") {
      setCurrentActionIndex(++currentActionIndex);
      if (currentActionIndex > actionsState.length - 1) {
        setCurrentActionState(actionsState[actionsState.length - 1]);
      } else {
        setCurrentActionState(actionsState[currentActionIndex]);
      }
      if (currentActionIndex === actionsState.length) {
        setIsCurrentStepDone(true);
        webcamRef.current = null;
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

  return (
    <div className="relative">
      <Webcam
        style={{ height: "350px", objectFit: "cover" }}
        className="mt-10 rounded-md sm:w-full md:w-full"
        audio={false}
        ref={webcamRef}
        height={720}
        screenshotFormat="image/jpeg"
        width={1280}
        onLoadedMetadata={(e) => onPlay()}
        videoConstraints={constraint}
      />
      <div className="circle-container">
        <CircularProgressBar />
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
