import { RootState } from "@/redux/app/store";
import React from "react";
import { useSelector } from "react-redux";
import Button from "../atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import i18n from "i18";
import ModalLayout from "../layout/ModalLayout";

interface IConfirmationModal {
  isShow: boolean;
  isDisabled: boolean;
  children: React.ReactNode;
  onConfirmHandler: () => void;
  onCancelHandler: () => void;
}

const ConfirmationModal = (props: IConfirmationModal) => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  return props.isShow ? (
    <ModalLayout size="sm" >
      {props.children}
      <div className="poppins-regular justify-center items-center flex-col-reverse flex gap-3  mt-5">
        <Button
          variant="ghost"
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.action_font_color
            ),
          }}
          onClick={() => {
            props.onCancelHandler();
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          size="none"
          className="py-2.5"
          disabled={props.isDisabled}
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color
            ),
          }}
          onClick={props.onConfirmHandler}
        >
          {t("confirm")}
        </Button>
      </div>
    </ModalLayout>
  ) : null;
};

export default ConfirmationModal;
