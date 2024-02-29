import React, { Fragment, useState } from "react";
import ModalLayout from "../layout/ModalLayout";
import Heading from "../atoms/Heading";
import Paragraph from "../atoms/Paraghraph";
import FRCamera from "../FRCamera";
import Button from "../atoms/Button";
import i18n from "i18";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useRouter } from "next/navigation";
import CameraOff from "@/public/icons/CameraOff";
import { Trans } from "react-i18next";

interface FaceRecognitionModalProps {
  callbackCaptureProcessor: (base64Img: string | null | undefined) => void;
  isShowModal: boolean;
  setIsShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  isDisabled: boolean;
  onCancelCallback?: () => void;
}

const FaceRecognitionModal: React.FC<FaceRecognitionModalProps> = ({
  isShowModal,
  title,
  setIsShowModal,
  callbackCaptureProcessor,
  onCancelCallback = () => {},
  isDisabled,
}) => {
  const [isUserMediaError, setIsUserMediaError] = useState<boolean>(false);

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;
  return isShowModal ? (
    <ModalLayout size="md">
      {isUserMediaError ? (
        <CameraNotFound />
      ) : (
        <Fragment>
          <Heading className="block pt-2 text-center">{title}</Heading>
          <Paragraph size="sm" className="mt-2 block text-center">
            {t("frSubtitle1")}
          </Paragraph>
          <FRCamera
            setIsUserMediaError={setIsUserMediaError}
            callbackCaptureProcessor={callbackCaptureProcessor}
          />
          <Button
            onClick={() => {
              setIsShowModal(false);
              onCancelCallback();
            }}
            size="none"
            variant="ghost"
            disabled={isDisabled}
            className="mt-3 mb-1 uppercase mx-auto font-bold disabled:opacity-50 text-base h-9"
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color
              ),
            }}
          >
            {t("cancel")}
          </Button>
        </Fragment>
      )}
    </ModalLayout>
  ) : null;
};

export default FaceRecognitionModal;

const CameraNotFound = () => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const router = useRouter();

  return (
    <div className="flex flex-col p-5">
      <Heading className="font-poppins font-semibold text-neutral800">
        {t("cameraNotFoundModal.title")}
      </Heading>
      <p className="text-base text-[#666] font-poppins mt-2 mx-auto">
        <Trans i18nKey="cameraNotFoundModal.subtitle">
          {" "}
          <CameraOff />
        </Trans>
      </p>
      <Button
        size="none"
        className="mr-0 mt-5"
        onClick={() => router.refresh()}
        style={{
          color: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.action_font_color
          ),
        }}
      >
        {t("cameraNotFoundModal.button")}
      </Button>
    </div>
  );
};
