import React, { Dispatch, SetStateAction } from "react";
import { PinInput } from "react-input-pin-code";

interface Props {
  width: number;
  values: string[];
  setValues: Dispatch<SetStateAction<string[]>>;
}

const OTPInput = (props: Props) => {
  return (
    <PinInput
      containerStyle={{
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        marginTop: "25px",
      }}
      inputStyle={{
        alignItems: "center",
        gap: 5,
        marginTop: "10px",
        width: props.width! / 8,
        height: props.width! / 8,
      }}
      size="lg"
      placeholder=""
      values={props.values}
      onChange={(_, __, values) => props.setValues(values)}
    />
  );
};

export default OTPInput;
