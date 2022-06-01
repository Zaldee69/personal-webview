import Image from "next/image";
import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = () => {
  const sigPad = useRef<any>();

  return (
    <div>
      <div className="flex w-full mt-5 border rounded-md border-[#DFE1E6] relative justify-center">
        <button
          onClick={() => sigPad.current.clear()}
          className="absolute z-50 top-2 right-2"
        >
          <Image alt="trash" width={35} height={35} src="/images/Frame.svg" />
        </button>
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{
            width: 320,
            height: 200,
            className: "sigCanvas ",
          }}
        />{" "}
      </div>
    </div>
  );
};

export default SignaturePad;
