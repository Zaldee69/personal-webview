import React from "react";

type Props = {
  value: string;
  name: string;
  placeholder: string;
  isError?: boolean;
  type?: React.HTMLInputTypeAttribute;
  customStyle?: string;
  isReadonly?: boolean;
  isDisabled?: boolean;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TextInput = ({
  value,
  name,
  placeholder,
  isError,
  type,
  customStyle,
  isReadonly,
  isDisabled,
  onChangeHandler,
}: Props) => {
  return (
    <input
      autoComplete="off"
      name={name}
      type={type && type}
      className={`w-full focus:outline-none ${
        isError ? "border-red300" : "border-borderColor"
      } focus:ring border placeholder:text-placeholder read-only:bg-neutral20 read-only:text-placeholder read-only:cursor-not-allowed placeholder:font-light rounded-md py-3 px-3 ${customStyle}`}
      placeholder={placeholder}
      value={value}
      onChange={onChangeHandler}
      readOnly={isReadonly}
      disabled={isDisabled}
    />
  );
};

export default TextInput;
