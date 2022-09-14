import { Dispatch, SetStateAction } from "react";
type Props = {
  look_right: boolean;
  distance: number;
  roll: number;
  isIndexDone: (i: any) => Promise<any>;
  setIndexDone: (i: any) => Promise<any>;
  currentActionIndex: number;
  clicked: boolean;
  capture: HTMLButtonElement;
  progressSetter: (number: number) => void
  wrongActionSetter: (error: boolean, message: string) => void;
};

const lookRightHandler = async ({
  look_right,
  distance,
  roll,
  progressSetter,
  capture,
  clicked,
  currentActionIndex,
  isIndexDone,
  setIndexDone,
  wrongActionSetter,
}: Props) => {
  if (look_right && distance < 25) {
    let done = await isIndexDone(currentActionIndex);
    if (!done) {
      await setIndexDone(currentActionIndex);
      progressSetter(100);
      capture.click();
      clicked = true;
      ++currentActionIndex;
    }
  } else if (roll > 30) {
    wrongActionSetter(true, "Wajah terlalu ke kiri");
  } else if (roll < -30) {
    wrongActionSetter(true, "Wajah terlalu ke kanan");
  } else if (roll > 20 && roll < 30) {
    wrongActionSetter(true, "Wajah kurang ke kanan");
  } else if (roll < -20 && roll > -30) {
    wrongActionSetter(true, "Wajah terlalu ke kiri");
  } else if (distance > 30) {
    wrongActionSetter(true, "Wajah terlalu jauh");
  }
};

export default lookRightHandler;
