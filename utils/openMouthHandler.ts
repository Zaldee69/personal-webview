import i18n from "i18";
import { log } from "@/utils/logging";

type Props = {
  distance: number;
  mouth_score: number;
  progressSetter: (number: number) => void;
  count: number;
  wrongActionSetter: (error: boolean, message: string) => void;
  isIndexDone: (i: any) => Promise<any>;
  setIndexDone: (i: any) => Promise<any>;
  currentActionIndex: number;
  clicked: boolean;
  capture: HTMLButtonElement;
  perfSetter: (display: string) => void;
  totalPersonOnCam: number;
  faceIsHalf: boolean;
  isDarkImage: boolean;
  blink_left_eye: boolean;
  blink_right_eye: boolean;
};

const openMouthHandler = async ({
  distance,
  mouth_score,
  progressSetter,
  count,
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
  blink_right_eye,
  blink_left_eye,
}: Props) => {
  const { t }: any = i18n;
  const isAppropriate =
    distance < 25 &&
    totalPersonOnCam <= 1 &&
    !faceIsHalf &&
    isDarkImage &&
    (!blink_right_eye || !blink_left_eye);
  if (mouth_score >= 0.3 && mouth_score < 0.39 && isAppropriate) {
    progressSetter(32);
    wrongActionSetter(false, t("openMouthError2"));
  } else if (mouth_score >= 0.4 && mouth_score < 0.49 && isAppropriate) {
    progressSetter(53);
    wrongActionSetter(false, t("openMouthError2"));
  } else if (mouth_score >= 0.5 && mouth_score < 0.59 && isAppropriate) {
    progressSetter(70);
    wrongActionSetter(false, t("openMouthError2"));
  } else if (mouth_score >= 0.64 && isAppropriate) {
    progressSetter(100);
    wrongActionSetter(false, "");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log(t("dontMove"), t("doNotMove"));
    perfSetter("block");
    await new Promise((resolve) => setTimeout(resolve, 500));
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
    progressSetter(0);
  } else if (blink_left_eye || blink_right_eye) {
    wrongActionSetter(true, t("openEyes"));
    log(t(""), "");
    count = 1;
    progressSetter(0);
  } else if (faceIsHalf) {
    wrongActionSetter(true, t("sideFace"));
    log(t(""), "");
    count = 1;
    progressSetter(0);
  } else if (distance > 25) {
    wrongActionSetter(true, t("closeYourFace"));
    log(t(""), "");
    count = 1;
    progressSetter(0);
  } else if (!isDarkImage) {
    wrongActionSetter(true, t("imageDark"));
    log(t(""), "");
    count = 1;
    progressSetter(0);
  } else {
    progressSetter(0);
    wrongActionSetter(true, t("openMouthError1"));
    log(t("dontMove"), "");
    count = 1;
    progressSetter(0);
  }
};

export default openMouthHandler;
