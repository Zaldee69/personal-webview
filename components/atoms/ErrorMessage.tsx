import React from "react";

type Props = {
  errorMessage: string;
};

const ErrorMessage = ({ errorMessage }: Props) => {
  return <p className="text-red300 ml-3 mt-1">{errorMessage}</p>;
};

export default ErrorMessage;
