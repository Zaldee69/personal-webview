import React from "react";

type Props = {
  children: React.ReactNode;
};

const ModalLayout = ({ children }: Props) => {
  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-center overflow-hidden transition-all duration-1000 justify-center  w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md pt-3 px-5 pb-3 poppins-regular rounded-md w-full mx-5 ">
        {children}
      </div>
    </div>
  );
};

export default ModalLayout;
