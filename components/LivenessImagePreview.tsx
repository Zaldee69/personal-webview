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
import CheckEvalGreenIcon from "@/public/icons/CheckOvalGreenIcon";
import { useCountdown } from "@/hooks/useCountdown";
import { Trans } from "react-i18next";
import { useRouter } from "next/router";

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

  const router = useRouter();

  const dispatch: AppDispatch = useDispatch();

  const { t }: any = i18n;

  const second = 5;

  const { timeLeft } = useCountdown(second);
  const { request_id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    const retryCount = getRetryCount((request_id + "c") as string);
    if (retryCount >= 3) {
      setTimeout(() => {
        verifyLiveness();
      }, 5000);
      setHideRetryButton(true);
    } else {
      if (isDone) {
        setRetryCount((request_id + "c") as string, Number(retryCount) + 1);
      }
    }
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="py-10 max-w-sm mx-auto px-2">
      <Heading>{t("livenessSelfiePreview.title")}</Heading>

      <Paragraph size="sm" className="mt-2 whitespace-pre-line">
        {isHideRetryButton ? (
          <Trans
            values={{
              timeLeft: timeLeft <= 0 ? 0 : timeLeft,
            }}
            i18nKey="livenessSelfiePreview.hasReachMaxRetakeSubtitle"
          ></Trans>
        ) : (
          t("livenessSelfiePreview.subtitle")
        )}
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
          {t(
            `livenessSelfiePreview.retake.${Number(
              getRetryCount((request_id + "c") as string)
            )}`
          )}
        </Button>
      )}

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default LivenessImagePreview;
