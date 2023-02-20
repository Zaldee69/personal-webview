import React from "react";

type Props = {
  children: React.ReactNode;
};

const ModalTemplate = ({ children }: Props) => {
  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full ">
        {children}
      </div>
    </div>
  );
};

export default ModalTemplate;
