import i18n from "i18";

type Props = {
    distance: number
    mouth_score: number 
    progressSetter: (number: number) => void
    count: number
    wrongActionSetter: (error: boolean, message: string ) => void
    isIndexDone: (i: any) => Promise<any>
    setIndexDone: (i: any) => Promise<any>
    currentActionIndex: number
    clicked: boolean
    capture: HTMLButtonElement
}

const openMouthHandler = async ({distance, mouth_score, progressSetter,count,isIndexDone, setIndexDone, currentActionIndex, clicked, capture, wrongActionSetter}: Props) => {
  const {t}: any = i18n
    if(mouth_score >= 0.3 && mouth_score < 0.39 && distance < 25) {
        progressSetter(32);
        wrongActionSetter(false, t("openMouthError2"))
      } else if(mouth_score >= 0.4 && mouth_score < 0.49 && distance < 25) {
        progressSetter(53);
        wrongActionSetter(false, t("openMouthError2"))
      } else if(mouth_score >= 0.5 && mouth_score < 0.59 && distance < 25) {
        progressSetter(70);
        wrongActionSetter(false, t("openMouthError2"))
      } else if(mouth_score >= 0.64 && distance < 25) {
        progressSetter(100);
        wrongActionSetter(false, t("openMouthError2"))
          let done = await isIndexDone(currentActionIndex);
          if (!done) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await setIndexDone(currentActionIndex);
            ++currentActionIndex;
            capture.click()
            clicked = true;
          }
      } else if (distance > 25) {
        wrongActionSetter(true, t("closeYourFace"))
        count = 1
      } else {
        wrongActionSetter(true, t("openMouthError1"))
        count = 1
      }
}

export default openMouthHandler