import React, { Dispatch, SetStateAction } from 'react'

// blink_left_eye,blink_right_eye, blinkCount, wrongActionSetter, setProgress, count, isIndexDone, setIndexDone, currentActionIndex, clicked, capture
let blinkCount : number = 1

type Props = {
    blink_left_eye: boolean
    blink_right_eye: boolean
    wrongActionSetter: (error: boolean, message: string ) => void
    progressSetter: (number: number) => void
    count: number
    isIndexDone: (i: any) => Promise<any>
    setIndexDone: (i: any) => Promise<any>
    currentActionIndex: number
    clicked: boolean
    capture: HTMLButtonElement
}

const blinkHandler = async ({blink_left_eye, blink_right_eye,count,progressSetter,isIndexDone,setIndexDone, currentActionIndex,clicked,capture,wrongActionSetter}: Props) => {
  if((blink_left_eye || blink_right_eye)){
    blinkCount >= 35 ? blinkCount : blinkCount++
    if(blinkCount >= 10 && blinkCount <= 19){
      progressSetter(30);
      wrongActionSetter(false, "")
    }else if(blinkCount >= 20 && blinkCount <= 29){
      progressSetter(65);
      wrongActionSetter(false, "")
    }else if(blinkCount === 35) {
      progressSetter(100);
      wrongActionSetter(false, "")
      let done = await isIndexDone(currentActionIndex);
      if (!done && count === 35 && blinkCount >= 35) {
        progressSetter(100);
           setIndexDone(currentActionIndex);
          ++currentActionIndex;
          capture.click()
          clicked = true;
      }
    }
  } else {
    wrongActionSetter(true, "Pejamkan mata Anda")
    blinkCount = 1
    count = 1
  }
}

export default blinkHandler