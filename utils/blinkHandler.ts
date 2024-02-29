import i18n from "i18";
let blinkCount: number = 1;
import { log } from "@/utils/logging";

type Props = {
  distance: number;
  blink_left_eye: boolean;
  blink_right_eye: boolean;
  wrongActionSetter: (error: boolean, message: string) => void;
  progressSetter: (number: number) => void;
  count: number;
  isIndexDone: (i: any) => Promise<any>;
  setIndexDone: (i: any) => Promise<any>;
  currentActionIndex: number;
  clicked: boolean;
  capture: HTMLButtonElement;
  perfSetter: (display: string) => void;
  totalPersonOnCam: number;
  faceIsHalf: boolean;
  isDarkImage: boolean;
};

const blinkHandler = async ({
  distance,
  blink_left_eye,
  blink_right_eye,
  count,
  progressSetter,
  isIndexDone,
  setIndexDone,
  currentActionIndex,
  clicked,
  capture,
  wrongActionSetter,
  perfSetter,
  totalPersonOnCam,
  faceIsHalf,
  isDarkImage,
}: Props) => {
  const isAppropriate =
    distance < 25 && totalPersonOnCam <= 1 && !faceIsHalf && isDarkImage;
  const { t }: any = i18n;
  if (blink_left_eye || (blink_right_eye && distance < 25 && isAppropriate)) {
    blinkCount >= 30 ? blinkCount : blinkCount++;
    if (
      blinkCount >= 10 &&
      blinkCount <= 19 &&
      distance < 25 &&
      isAppropriate
    ) {
      progressSetter(30);
      wrongActionSetter(false, "");
    } else if (
      blinkCount >= 20 &&
      blinkCount <= 29 &&
      distance < 25 &&
      isAppropriate
    ) {
      progressSetter(65);
      wrongActionSetter(false, "");
    } else if (blinkCount === 30 && distance < 25 && isAppropriate) {
      progressSetter(100);
      wrongActionSetter(false, "");
      await new Promise((resolve) => setTimeout(resolve, 500));
      log(t("dontMove"), t("doNotMove"));
      perfSetter("block");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let done = await isIndexDone(currentActionIndex);
      if (!done) {
        setIndexDone(currentActionIndex);
        ++currentActionIndex;
        capture.click();
        clicked = true;
      }
    } else if (totalPersonOnCam > 1) {
      wrongActionSetter(true, t("faceMoreThan1"));
      log(t(""), "");
      count = 1;
      blinkCount = 1;
    } else if (faceIsHalf) {
      wrongActionSetter(true, t("sideFace"));
      log(t(""), "");
      blinkCount = 1;
      count = 1;
    } else if (distance > 25) {
      wrongActionSetter(true, t("closeYourFace"));
      log(t("closeYourFace"), "");
    } else if (!isDarkImage) {
      wrongActionSetter(true, t("imageDark"));
      log(t(""), "");
      count = 1;
      progressSetter(0);
    }
  } else if (!isDarkImage) {
    wrongActionSetter(true, t("imageDark"));
    log(t(""), "");
    count = 1;
    progressSetter(0);
  } else if (faceIsHalf) {
    wrongActionSetter(true, t("sideFace"));
    log(t(""), "");
    blinkCount = 1;
    count = 1;
    wrongActionSetter(true, t("closeYourFace"));
  } else if (totalPersonOnCam > 1) {
    wrongActionSetter(true, t("faceMoreThan1"));
    log(t(""), "");
    count = 1;
    blinkCount = 1;
  } else if (distance > 25) {
    log(t("closeYourFace"), "");
  }  else {
    wrongActionSetter(true, t("blinkError"));
    log(t("dontMove"), "");
    blinkCount = 1;
    count = 1;
  }
};

export default blinkHandler;
