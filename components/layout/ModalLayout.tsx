import React from "react";

type Props = {
  children: React.ReactNode;
  size: "sm" | "md" | "lg"
};

const ModalLayout = ({ children, size }: Props) => {
  const modalSize = 'max-w-'.concat(size)
  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-center overflow-hidden transition-all duration-1000 justify-center  w-full left-0 top-0 h-full "
    >
      <div className={`bg-white p-2 poppins-regular rounded-md w-fit mx-5 ${modalSize}`}>
        {children}
      </div>
    </div>
  );
};

export default ModalLayout;
