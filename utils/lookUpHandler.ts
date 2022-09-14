import { Dispatch, SetStateAction } from 'react'

type Props = {
    distance: number
    roll: number
    yaw: number
    pitch: number
    isIndexDone: (i: any) => Promise<any>
    setIndexDone: (i: any) => Promise<any>
    currentActionIndex: number
    clicked: boolean
    capture: HTMLButtonElement
    progressSetter: (number: number) => void
    wrongActionSetter: (error: boolean, message: string ) => void
}

const lookUpHandler = async ({distance, roll, yaw, pitch, progressSetter, capture, clicked, currentActionIndex, isIndexDone, setIndexDone, wrongActionSetter} : Props) => {
  if ((roll > -20) && (roll < 20)) {
    if ((yaw > -20) && (yaw < 20)) {
      if ((pitch < -19) && (pitch > -31)) {
        let done = await isIndexDone(currentActionIndex);
        if (!done) {
          await setIndexDone(currentActionIndex);
          progressSetter(100);
          ++currentActionIndex;
          capture.click();
          clicked = true;
        }
      } else if (distance > 23) {
        wrongActionSetter(true, "Dekatkan wajah ke kamera")
      } else if (pitch > -39) {
        wrongActionSetter(true, "Wajah terlalu ke bawah")
      } else if (pitch < -41) {
        wrongActionSetter(true, "Wajah terlalu ke atas")
      } else if (pitch > -41 && pitch < -39) {
        wrongActionSetter(true, "Wajah kurang ke atas")
      } else if (pitch < -39 && pitch > -41) {
        wrongActionSetter(true, "Wajah kurang ke bawah")
      }
    }
  } else if (distance > 23) {
    wrongActionSetter(true, "Dekatkan wajah ke kamera")
  } else if (roll > 30) {
    wrongActionSetter(true, "Wajah terlalu ke kiri")
  } else if (roll < -30) {
    wrongActionSetter(true, "Wajah ke kanan")
  } else if (roll > 20 && roll < 30) {
    wrongActionSetter(true, "Wajah kurang ke atas")
  } else if (roll < -20 && roll > -30) {
    wrongActionSetter(true, "Wajah kurang ke kiri")
  }
}

export default lookUpHandler