import React, { ReactNode } from "react";
import ModalLayout from "../layout/ModalLayout";
import CloseIcon from "@/public/icons/CloseIcon";
import Heading from "../atoms/Heading";

interface IModalHeadingProps {
  headingTitle: string;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  withCloseButton?: boolean;
}

interface IModalProps extends IModalHeadingProps {
  children: ReactNode;
  isShowModal: boolean;
  size?: "sm" | "md" | "lg"
}

const Modal: React.FC<IModalProps> = ({
  children,
  withCloseButton = true,
  setModal,
  headingTitle,
  isShowModal,
  size
}) => {
  return isShowModal ? (
    <ModalLayout size={size} >
      <ModalHeading
        setModal={setModal}
        headingTitle={headingTitle}
        withCloseButton={withCloseButton}
      />
      {children}
    </ModalLayout>
  ) : null;
};

const ModalHeading: React.FC<IModalHeadingProps> = ({
  headingTitle,
  setModal,
  withCloseButton,
}) => {
  return (
    <div
      className={`flex py-2 items-center ${
        withCloseButton ? "justify-between" : "justify-center"
      } `}
    >
      {withCloseButton ? (
        <button className="opacity-0 hover:cursor-default">
          <CloseIcon />
        </button>
      ) : null}
      <Heading>{headingTitle}</Heading>
      {withCloseButton ? (
        <button onClick={() => setModal(false)} className="hover:opacity-50">
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
};

export default Modal;
