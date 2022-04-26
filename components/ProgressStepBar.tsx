import React from "react";
import CheckIcon from "../public/icons/CheckIcon";

const ProgressStepBar = () => {
  return (
    // <div className="w-full mt-16" >
    //   <div className="step-wrapper">
    //     <div className="progress" id="progress"></div>
    //       <div  className={`progress-step  active `}>
    //           <CheckIcon/>
    //       </div>
    //       <div  className={`progress-step  active `}>
    //           <CheckIcon/>
    //       </div>
    //       <div  className={`progress-step  active `}>
    //           3
    //       </div>
    //       <div  className={`progress-step  active `}>
    //           4
    //       </div>
    //   </div>
    // </div>
    <div className="mt-10">
        <div className="step-wrapper">
        <div className="progress" id="progress"></div>
      <div className={`progress-step active`}>
        <CheckIcon />
      </div>
      <div className={`progress-step active`}>
        <CheckIcon />
      </div>
      <div className={`progress-step active`}>
          <span className="ml-2">3</span>
      </div>
      <div className={`progress-step `}>
          <span className="ml-2" >4</span>
      </div>
    </div>
    </div>
    
  );
};

export default ProgressStepBar;
