/* eslint-disable @next/next/no-img-element */
import { AppDispatch, RootState } from "@/redux/app/store";
import i18n from "i18";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Heading from "./atoms/Heading";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import {
  resetImages,
  setIsDone,
  setIsRetry,
} from "@/redux/slices/livenessSlice";
import Button from "./atoms/Button";
import Paragraph from "./atoms/Paraghraph";
import {
  getFRFailedCount as getRetryCount,
  setFRFailedCount as setRetryCount,
} from "@/utils/frFailedCountGetterSetter";
import Footer from "./Footer";
import { cn } from "@/utils/twClassMerge";
import { useRouter } from "next/router";
import CheckEvalGreenIcon from "@/public/icons/CheckOvalGreenIcon";

const LivenessImagePreview = ({
  verifyLiveness,
  setCurrentActionIndex,
}: {
  verifyLiveness: () => void;
  setCurrentActionIndex: Dispatch<SetStateAction<number>>;
}) => {
  const themeConfiguration = useSelector((state: RootState) => state.theme);
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);

  const [isHideRetryButton, setHideRetryButton] = useState<boolean>(false);
  const [retakeButtonTitle, setRetakeButtonTitle] = useState<string>("");

  const dispatch: AppDispatch = useDispatch();

  const { t }: any = i18n;

  const setButtonTitleForRetakeCount = (retryCount: number) => {
    switch (retryCount) {
      case 0:
        setRetakeButtonTitle(t("livenessSelfiePreview.retake.1"));
        break;

      case 1:
        setRetakeButtonTitle(t("livenessSelfiePreview.retake.2"));
        break;

      case 2:
        setRetakeButtonTitle(t("livenessSelfiePreview.retake.3"));
        break;
    }
  };

  useEffect(() => {
    const retryCount = getRetryCount("retry_count");
    if (retryCount >= 3) {
      setTimeout(() => {
        verifyLiveness();
      }, 5000);
      setHideRetryButton(true);
    } else {
      if (isDone) {
        setRetryCount("retry_count", Number(retryCount) + 1);
      }
    }
    setButtonTitleForRetakeCount(Number(retryCount));
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="py-10 max-w-sm mx-auto px-2">
      <Heading>{t("livenessSelfiePreview.title")}</Heading>

      <Paragraph size="sm" className="mt-2 whitespace-pre-line">
        {isHideRetryButton
          ? t("livenessSelfiePreview.hasReachMaxRetakeSubtitle")
          : t("livenessSelfiePreview.subtitle")}
      </Paragraph>

      <div className="my-6">
        <img
          className="rounded-md"
          src={images.filter((el) => el.action === "look_straight")[0].value}
          alt="Selfie Image Preview"
        />
      </div>

      <div
        className={cn("", {
          hidden: isHideRetryButton,
          block: !isHideRetryButton,
        })}
      >
        <Paragraph className="font-semibold">
          {t("livenessSelfiePreview.listHeading")}
        </Paragraph>
        <span className="flex gap-2 items-start mt-2">
          <CheckEvalGreenIcon />
          <Paragraph size="sm">{t("livenessSelfiePreview.list1")}</Paragraph>
        </span>
        <span className="flex gap-2 items-start">
          <div className="flex-shrink">
            <CheckEvalGreenIcon />
          </div>
          <Paragraph size="sm">{t("livenessSelfiePreview.list2")}</Paragraph>
        </span>
        <span className="flex gap-2 items-start">
          <div className="flex-shrink">
            <CheckEvalGreenIcon />
          </div>
          <Paragraph size="sm">{t("livenessSelfiePreview.list3")}</Paragraph>
        </span>
        <span className="flex gap-2 items-start">
          <div className="flex-shrink">
            <CheckEvalGreenIcon />
          </div>
          <Paragraph size="sm">{t("livenessSelfiePreview.list4")}</Paragraph>
        </span>
        <span className="flex gap-2 items-start">
          <div className="flex-shrink">
            <CheckEvalGreenIcon />
          </div>
          <Paragraph size="sm">{t("livenessSelfiePreview.list5")}</Paragraph>
        </span>
      </div>

      <Button
        size="none"
        onClick={() => {
          dispatch(setIsDone(false));
          verifyLiveness();
        }}
        style={{
          backgroundColor: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.button_color as string
          ),
        }}
        className="bg-neutral200 mt-[42px] px-3 py-2.5 text-sm font-medium block mx-auto w-44"
      >
        {t("next")}
      </Button>

      {isHideRetryButton ? null : (
        <Button
          size="none"
          onClick={() => {
            dispatch(resetImages());
            setCurrentActionIndex(0);
            dispatch(setIsDone(false));
            dispatch(setIsRetry(true));
          }}
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
            borderColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
          }}
          className={cn(
            "border px-3 mt-2 py-2.5 text-sm font-medium mx-auto w-44"
          )}
        >
          {retakeButtonTitle}
        </Button>
      )}

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default LivenessImagePreview;
