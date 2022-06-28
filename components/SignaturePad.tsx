import Image from "next/image";
import React, { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/app/store";
import { removeSignature } from "@/redux/slices/signatureSlice";

type Props = {
  sigPad: React.MutableRefObject<any>;
};

const SignaturePad = ({ sigPad }: Props) => {
  const [showInitialSig, setShowInitialSig] = useState(true);
  const dispatch: AppDispatch = useDispatch();
  const res = useSelector((state: RootState) => state.document);
  const data = useSelector((state: RootState) => state.signature);

  const action = () => {
    sigPad.current.clear()
    dispatch(removeSignature());
  }

  return (
    <div>
      <div className="flex w-full mt-5 border rounded-md border-[#DFE1E6] relative justify-center">
        <button
          onClick={() => {
            showInitialSig ? setShowInitialSig(false) : action()
          }}
          type="button"
          className="absolute z-50 top-2 right-2"
        >
          <Image alt="trash" width={35} height={35} src="/images/Frame.svg" />
        </button>
        {(showInitialSig && res.response.data.tandaTangan) || showInitialSig &&
        data?.data.scratch ? (
          <img
            onClick={() => setShowInitialSig(false)}
            style={{ touchAction: "none", width: "200px", height: "200px" }}
            src={`data:image/png;base64,${
              data?.data.scratch
                ? data?.data.scratch.split(",")[1]
                : res.response.data.tandaTangan.replaceAll('"', "")
            }`}
            alt="signature"
          />
        ) : (
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              width: 320,
              height: 200,
              className: "sigCanvas ",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
