import React from "react";
import Paragraph from "./Paraghraph";

interface RadioButtonProps {
  onChangeHandler: (e: React.FormEvent<HTMLInputElement>) => void;
  isChecked: boolean;
  title: string;
  fontFamily?: string;
  name: string;
  type: "bullet" | "button";
  value: string | number;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  onChangeHandler,
  isChecked,
  title,
  fontFamily,
  type,
  name,
  value,
}) => {
  return type === "button" ? (
    <label className="relative flex items-center justify-center cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChangeHandler}
        checked={isChecked}
        className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12 cursor-pointer"
      />
      <p
        className={`text-2xl text-_030326 absolute w-fit text-center ${fontFamily} `}
      >
        {title}
      </p>
    </label>
  ) : (
    <label className="flex items-center mt-2 cursor-pointer">
      <input
        name={name}
        value={value}
        onChange={onChangeHandler}
        checked={isChecked}
        type="radio"
        className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
      />
      <Paragraph className="ml-2.5">{title}</Paragraph>
    </label>
  );
};

export default RadioButton;
