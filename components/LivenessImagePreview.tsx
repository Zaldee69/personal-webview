/* eslint-disable @next/next/no-img-element */
import { AppDispatch, RootState } from "@/redux/app/store";
import i18n from "i18";
import { Dispatch, SetStateAction, useEffect } from "react";
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
  setFRFailedCount as setIsRetryCount,
} from "@/utils/frFailedCountGetterSetter";
import Footer from "./Footer";

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

  const dispatch: AppDispatch = useDispatch();

  const { t }: any = i18n;

  useEffect(() => {
    const retryCount = getRetryCount("retry_count");
    if (retryCount >= 3) {
      verifyLiveness();
    }
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="py-10 max-w-sm mx-auto px-2">
      <Heading>{t("livenessSelfiePreview.title")}</Heading>
      <Paragraph size="sm" className="mt-2 whitespace-pre-line">
        {t("livenessSelfiePreview.subtitle")}
      </Paragraph>
      <div className="my-9">
        <img
          className="rounded-md"
          src={images.filter((el) => el.action === "look_straight")[0].value}
          alt="Selfie Image Preview"
        />
      </div>
      <Button
        onClick={() => {
          dispatch(setIsDone(false));
          verifyLiveness();
        }}
        style={{
          backgroundColor: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.button_color as string
          ),
        }}
        className="bg-neutral200 mt-6 px-3 py-2.5 text-sm font-medium block mx-auto w-40"
      >
        {t("next")}
      </Button>
      <Button
        onClick={() => {
          dispatch(resetImages());
          setCurrentActionIndex(0);
          dispatch(setIsDone(false));
          dispatch(setIsRetry(true));
          const retryCount = Number(getRetryCount("retry_count"));

          setIsRetryCount("retry_count", retryCount + 1);
        }}
        style={{
          color: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.button_color as string
          ),
          borderColor: themeConfigurationAvaliabilityChecker(
            themeConfiguration?.data.button_color as string
          ),
          paddingLeft: 0,
          paddingRight: 0,
        }}
        className="border px-3 mt-2 py-2.5 text-sm font-medium block mx-auto w-40"
      >
        {t("livenessSelfiePreview.retryBtn")}
      </Button>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default LivenessImagePreview;
