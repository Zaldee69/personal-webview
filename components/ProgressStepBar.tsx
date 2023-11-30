import React from "react";
import CheckIcon from "../public/icons/CheckIcon";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

interface Props {
  currentActionIndex: number;
  step?: number;
  actionList: string[];
}

interface ProgressDotProps {
  currentActionIndex: number;
  step: number;
}

const ProgressDot: React.FC<ProgressDotProps> = ({
  currentActionIndex,
  step,
}) => {
  if (currentActionIndex > step - 1) {
    return <CheckIcon />;
  } else {
    return <span className="ml-2">{step}</span>;
  }
};

const ProgressStepBar: React.FC<Props> = ({
  currentActionIndex,
  actionList,
}) => {
  const isActionList = actionList?.length == 4 ? "2" : "";
  const router = useRouter();
  const isRetry = useSelector((state: RootState) => state.liveness.isRetry);

  console.log(isRetry)

  if (router.isReady && actionList.length == 4) {
    const progress = document?.getElementById("progress2");
    const active = document?.querySelectorAll(".aktif");

    progress === null
      ? ""
      : (progress.style.width =
          active.length === 1
            ? "28%"
            : active.length === 2
            ? "57%"
            : active.length === 3
            ? "85%"
            : "85%");
  }

  return (
    <div className="mt-10 px-10">
      {isRetry ? (
        <div className={`step-wrapper`}>
          <div className={`progress active}`} id={`progress`}></div>

          <div className={`progress-step`}>
            <ProgressDot step={1} currentActionIndex={0} />
          </div>

          <div className={`progress-step aktif`}>
            <ProgressDot step={2} currentActionIndex={2} />
          </div>
        </div>
      ) : (
        <div className={`step-wrapper${isActionList}`}>
          <div
            className={`progress${isActionList} ${
              currentActionIndex >= 1 ? "active" : ""
            }`}
            id={`progress${isActionList}`}
          ></div>
          {actionList.map((el, idx) => {
            return (
              <div
                key={idx}
                className={`progress-step ${
                  currentActionIndex >= idx ? "aktif" : ""
                }`}
              >
                <ProgressDot
                  step={idx + 1}
                  currentActionIndex={currentActionIndex}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressStepBar;
