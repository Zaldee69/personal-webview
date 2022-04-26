import React from "react";

const CircularProgressBar = () => {
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 140 160"
      className="percent svg"
      id="percent"
    >
      <ellipse id="track" className="track" cx="50%" cy="50%" rx="51" ry="71" />
      <ellipse
        id="circle"
        className="progress-circle"
        cx="50%"
        cy="50%"
        rx="51"
        ry="71"
      />
    </svg>
  );
};

export default CircularProgressBar;
