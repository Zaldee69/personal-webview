import { shuffleArray } from "@/utils/shuffleArray";
import React, { useEffect, useState } from "react";
import ArrowLeftIcon from "@/public/icons/ArrowLeftIcon";
import DeleteIcon from "@/public/icons/DeleteIcon";
import Image from "next/legacy/image";
import { assetPrefix } from "next.config";
import Footer from "./Footer";
import { buttonVariants } from "./atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Heading from "./atoms/Heading";
import Paragraph from "./atoms/Paraghraph";

interface IPropsPinFormComponent {
  title: string;
  subTitle?: string;
  digitLength: number;
  isRandom: boolean;
  onClickNumberHandlerCallback: (value: number) => void;
  onClickDeleteHandlerCallback: () => void;
  submitFormCallback: (pin: string) => void;
  isResetAfterSubmit?: boolean;
  isErrorAfterSubmit?: boolean;
  isErrorAfterSubmitMessage?: string;
  isButtonNumberDisabled?: boolean;
  isError?: boolean;
  isErrorMessage?: string;
  isProcessed?: boolean;
  cancelLink?: {
    show?: boolean;
    title?: string;
    onClickCancelCallback?: (event: React.SyntheticEvent) => void;
  };
  showPoweredByTilaka?: boolean;
  backButton?: {
    show?: boolean;
    onClickBackCallback?: (event: React.SyntheticEvent) => void;
  };
}

type TNumbers = Array<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;

const PinFormComponent = (props: IPropsPinFormComponent): JSX.Element => {
  const [numbers, setNumbers] = useState<TNumbers>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
  ]);
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [values, setValues] = useState<Array<number>>([]);
  const [digitArr, setDigitArr] = useState<Array<boolean>>(
    Array.apply(null, Array(props.digitLength)).map((_) => false)
  );
  const [onDelete, setOnDelete] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const shouldShowErrorAfterSubmit: boolean =
    values.length === props.digitLength && props.isErrorAfterSubmit
      ? true
      : false;

  const resetPinForm = () => {
    setValues([]);
    setDigitArr(Array.apply(null, Array(props.digitLength)).map((_) => false));
  };

  const onClickNumberHandler = (_: React.SyntheticEvent, value: number) => {
    if (props.isErrorAfterSubmit || props.isError) {
      resetPinForm();
      props.onClickDeleteHandlerCallback();
    }
    setValues((prev) => [...prev, value]);
    setOnDelete(false);
    props.onClickNumberHandlerCallback(value);
  };
  const onClickDeleteHandler = (_: React.SyntheticEvent) => {
    if (props.isErrorAfterSubmit || props.isError) {
      resetPinForm();
    } else {
      setValues((prev) => {
        prev.pop();
        return [...prev];
      });
    }
    if (values.length === 0 || props.isErrorAfterSubmit || props.isError) {
      setOnDelete(false);
    } else {
      setOnDelete(true);
    }
    props.onClickDeleteHandlerCallback();
  };
  const submitPinForm = (pin: string): void => {
    setSubmitted(true);
    props.submitFormCallback(pin);
  };
  const valuesToString = (values: Array<number>): string => {
    return values.join("");
  };

  useEffect(() => {
    if (props.isRandom) setNumbers((prev) => shuffleArray(prev));
    return;
  }, [props.isRandom]);
  useEffect(() => {
    setShouldRender(true);
  }, [numbers]);
  useEffect(() => {
    if (values.length > props.digitLength) return;

    if (onDelete) {
      setDigitArr((prev) => {
        prev[values.length] = !prev[values.length];
        return [...prev];
      });
    } else {
      setDigitArr((prev) => {
        prev[values.length - 1] = !prev[values.length - 1];
        return [...prev];
      });
    }

    if (values.length === props.digitLength) {
      submitPinForm(valuesToString(values));
    }

    return;
  }, [values, onDelete]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (submitted && props.isResetAfterSubmit && !props.isErrorAfterSubmit) {
      setTimeout(() => {
        resetPinForm();
      }, 300);
    }
    setSubmitted(false);
    return;
  }, [props.isErrorAfterSubmit]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) null;

  return (
    <div className="card-pin-form">
      {props.backButton?.show && (
        <button
          onClick={props.backButton.onClickBackCallback}
          className="absolute top-7 left-7 hover:opacity-80"
        >
          <ArrowLeftIcon />
        </button>
      )}
      <Heading className="text-center text-neutral800 text-base font-semibold">
        {props.title}
      </Heading>
      {props.subTitle && (
        <Paragraph className="text-center text-neutral200 text-xs font-normal mt-2.5">
          {props.subTitle}
        </Paragraph>
      )}
      <div className="mt-8">
        <div
          className={[
            "text-center",
            props.isProcessed ? "block" : "hidden",
          ].join(" ")}
        >
          <Image
            src={`${assetPrefix}/images/loader.svg`}
            width="30"
            height="30"
            alt="loader"
            className="animate-spin"
          />
        </div>
        <div className={[props.isProcessed ? "hidden" : "block"].join(" ")}>
          <div className="flex items-center justify-center">
            {digitArr.map((e, i) => (
              <div
                key={i}
                className={[
                  "bullet-pin-form",
                  e
                    ? shouldShowErrorAfterSubmit
                      ? "bg-red300"
                      : "bg-primary"
                    : "bg-neutral30",
                ].join(" ")}
              ></div>
            ))}
          </div>
        </div>
        {/* <div className={[props.isProcessed ? "hidden" : "block"].join(" ")}> */}
        {props.isError && (
          <p className="text-red300 text-xs mt-3 text-center font-poppins">
            {props.isErrorMessage || "checkstep error"}
          </p>
        )}
        {/* </div> */}
      </div>
      {shouldShowErrorAfterSubmit && (
        <p className="text-red300 text-xs mt-3 text-center font-poppins">
          {props.isErrorAfterSubmitMessage || "there is something wrong"}
        </p>
      )}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {numbers.map((num, i) => {
          return (
            <React.Fragment key={i}>
              <button
                key={i}
                className="btn-pin-form"
                onClick={(e) => onClickNumberHandler(e, num)}
                disabled={props.isButtonNumberDisabled}
              >
                {num}
              </button>
              {i === 8 && <button className="btn-pin-form-invisible"></button>}
              {i === 9 && (
                <button
                  className="btn-pin-form"
                  onClick={onClickDeleteHandler}
                  disabled={props.isButtonNumberDisabled && props.isProcessed}
                >
                  <DeleteIcon />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {props.cancelLink?.show && (
        <div className="mt-7 text-center">
          <p
            onClick={props.cancelLink.onClickCancelCallback}
            style={{
              color: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.action_font_color as string
              ),
            }}
            className={buttonVariants({
              variant: "ghost",
              size: "none",
              className: "font-semibold text-sm",
            })}
          >
            {props.cancelLink.title}
          </p>
        </div>
      )}
      {props.showPoweredByTilaka && <Footer addMarginBottom />}
    </div>
  );
};

export default PinFormComponent;
