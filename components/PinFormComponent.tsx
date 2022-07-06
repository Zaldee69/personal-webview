import { shuffleArray } from "@/utils/shuffleArray";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@/public/icons/DeleteIcon";

interface IPropsPinFormComponent {
  title: string;
  digitLength: number;
  isRandom: boolean;
  onClickNumberHandlerCallback: (value: number) => void;
  onClickDeleteHandlerCallback: () => void;
  submitFormCallback: (pin: string) => void;
  isResetAfterSubmit?: boolean;
  isErrorAfterSubmit?: boolean;
  isErrorAfterSubmitMessage?: string;
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

  const shouldShowErrorAfterSubmit: boolean =
    values.length === props.digitLength && props.isErrorAfterSubmit
      ? true
      : false;

  const onClickNumberHandler = (_: React.SyntheticEvent, value: number) => {
    if (values.length === props.digitLength) return;
    setValues((prev) => [...prev, value]);
    setOnDelete(false);
    props.onClickNumberHandlerCallback(value);
  };
  const onClickDeleteHandler = (_: React.SyntheticEvent) => {
    setValues((prev) => {
      prev.pop();
      return [...prev];
    });
    if (values.length === 0) {
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
  }, [values, onDelete]);
  useEffect(() => {
    if (submitted && props.isResetAfterSubmit && !props.isErrorAfterSubmit) {
      setTimeout(() => {
        setValues([]);
        setDigitArr(
          Array.apply(null, Array(props.digitLength)).map((_) => false)
        );
      }, 300);
    }
    setSubmitted(false);
    return;
  }, [submitted, props.isResetAfterSubmit, props.isErrorAfterSubmit]);

  if (!shouldRender) null;

  return (
    <div className="card-pin-form">
      <p className="text-center text-neutral800 text-base font-semibold font-poppins">
        {props.title}
      </p>
      <div className="flex items-center justify-center mt-8">
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
      {shouldShowErrorAfterSubmit ? (
        <p className="text-red300 text-xs mt-3 text-center font-poppins">
          {props.isErrorAfterSubmitMessage || "there is something wrong"}
        </p>
      ) : (
        <p className="text-red300 text-xs mt-3 text-center font-poppins invisible">
          error-message-invisible
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
              >
                {num}
              </button>
              {i === 8 && <button className="btn-pin-form-invisible"></button>}
              {i === 9 && (
                <button className="btn-pin-form" onClick={onClickDeleteHandler}>
                  <DeleteIcon />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PinFormComponent;
