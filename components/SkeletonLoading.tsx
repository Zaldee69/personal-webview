import React from "react";

type Props = {
  isDouble?: boolean;
  width?: string;
  height?: string;
};

const SkeletonLoading = (props: Props) => {
  return (
    <>
      {props.isDouble ? (
        <>
          <div
            className={`bg-[#E6E6E6] ${props.width} ${props.height} text-[#E6E6E6] rounded-xl animate-pulse`}
          >
            w
          </div>
          <div
            className={`bg-[#E6E6E6] ${props.width} ${props.height} text-[#E6E6E6] mt-2 rounded-xl animate-pulse`}
          >
            w
          </div>
        </>
      ) : (
        <div
          className={`bg-[#E6E6E6] ${props.width} ${props.height} text-[#E6E6E6] rounded-xl animate-pulse`}
        >
          w
        </div>
      )}
    </>
  );
};

export default SkeletonLoading;
