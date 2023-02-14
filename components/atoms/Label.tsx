import React from "react";

type Props = {
  title: string;
  htmlFor?: string;
  isDisabled?: boolean;
  customStyle?: string;
};

const Label = ({ title, htmlFor, isDisabled, customStyle }: Props) => {
  return (
    <label
      className={`block font-semibold mb-2 ml-3 mt-4 ${
        isDisabled ? "text-placeholder" : "text-label"
      } ${customStyle}`}
      htmlFor={htmlFor}
    >
      {title}
    </label>
  );
};

export default Label;
