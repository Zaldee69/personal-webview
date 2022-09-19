import React, { Dispatch, SetStateAction } from 'react'

type Props = {
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

const openMouthHandler = async ({mouth_score, progressSetter,count,isIndexDone, setIndexDone, currentActionIndex, clicked, capture, wrongActionSetter}: Props) => {
  const openMouthBigger : string = "Buka mulut lebih besar"
    if(mouth_score >= 0.3 && mouth_score < 0.39) {
        progressSetter(32);
        wrongActionSetter(false, openMouthBigger)
      } else if(mouth_score >= 0.4 && mouth_score < 0.49) {
        progressSetter(53);
        wrongActionSetter(false, openMouthBigger)
      } else if(mouth_score >= 0.5 && mouth_score < 0.59) {
        progressSetter(70);
        wrongActionSetter(false, openMouthBigger)
      } else if(mouth_score >= 0.64) {
        progressSetter(100);
        wrongActionSetter(false, openMouthBigger)
          let done = await isIndexDone(currentActionIndex);
          if (!done) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await setIndexDone(currentActionIndex);
            ++currentActionIndex;
            capture.click()
            clicked = true;
          }
      }  else {
        wrongActionSetter(true, "Buka mulut anda")
        count = 1
      }
}

export default openMouthHandler