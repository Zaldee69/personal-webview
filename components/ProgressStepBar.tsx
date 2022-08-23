import React from "react";
import CheckIcon from "../public/icons/CheckIcon";


interface Props {
  currentActionIndex: number
  step?: number
}

interface ProgressDotProps {
  currentActionIndex: number
  step: number
}

const ProgressDot : React.FC<ProgressDotProps> = ({currentActionIndex, step}) => {
  if(currentActionIndex > (step - 1)){
    return <CheckIcon />
  } else {
    return <span className="ml-2">{ step }</span>
  }
}

const ProgressStepBar: React.FC<Props> = ({
  currentActionIndex
}) => {
  return (
    <div className="mt-10 px-10">
        <div className="step-wrapper">
        <div className={`progress ${currentActionIndex >= 1 ? "active" : ""}`} id="progress"></div>
      <div className={`progress-step ${currentActionIndex >= 0 ? "active" : ""}`}>
        <ProgressDot step={1} currentActionIndex={currentActionIndex}/>
      </div>
      <div className={`progress-step ${currentActionIndex >= 1 ? "active" : ""}`}>
        <ProgressDot step={2} currentActionIndex={currentActionIndex}/>
      </div>
    </div>
    </div>
    
  );
};

export default ProgressStepBar;
