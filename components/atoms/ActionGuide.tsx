import Image from "next/legacy/image";
import React from "react";
import i18n from "i18";
import Paragraph from "./Paraghraph";

type ActionGuide1Props = {
  actionList: any[];
  failedMessage: string;
  actionText: (text: string) => any;
  currentActionIndex: number;
  imageSrc: string;
};

type ActionGuide2Props = {
  isGenerateAction: boolean;
  isMustReload: boolean;
  imageSrc: string;
};

export const ActionGuide1 = (props: ActionGuide1Props) => {
  const { t }: any = i18n;

  return (
    <div className="flex gap-5 mx-2 mt-5">
      <div className="mt-1">
        {props.actionList.length === 2 && (
          <Image src={props.imageSrc} width={50} height={50} alt="2" />
        )}
      </div>
      <div className="flex flex-col">
        <Paragraph>
          {props.actionText(props.actionList[props.currentActionIndex])}
        </Paragraph>
        {props.failedMessage ? (
          <span className="poppins-regular text-sm text-red300">
            {props.failedMessage}
          </span>
        ) : (
          <Paragraph size="sm">
            {props.actionList.length > 1 && t("dontMove")}
          </Paragraph>
        )}
      </div>
    </div>
  );
};

export const ActionGuide2 = (props: ActionGuide2Props) => {
  const { t }: any = i18n;
  return (
    <div className="flex gap-5 mx-2 mt-5">
      <div className="mt-1">
        {!props.isGenerateAction && (
          <Image
            src={props.imageSrc}
            width={50}
            height={50}
            alt="1"
            layout="fixed"
          />
        )}
      </div>
      <div className="flex items-center justify-center flex-col">
        <span className={`poppins-regular w-full font-medium`}>
          {t("lookStraight")}
        </span>
        <span
          id={props.isMustReload ? "" : "log"}
          className=" poppins-regular text-sm w-full  text-neutral"
        >
          {t("dontMove")}
        </span>
      </div>
    </div>
  );
};
