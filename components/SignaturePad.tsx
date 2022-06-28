import Image from "next/image";
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

type Props = {
  sigPad : React.MutableRefObject<any>
}

const SignaturePad = ({sigPad} : Props) => {
  const [showInitialSig, setShowInitialSig] = useState(true)
  const res = useSelector((state : RootState) => state.document)
  return (
    <div>
      <div className="flex w-full mt-5 border rounded-md border-[#DFE1E6] relative justify-center">
        <button
          onClick={() => {
           showInitialSig ? setShowInitialSig(false) : sigPad.current.clear()
          }}
          type="button"
          className="absolute z-50 top-2 right-2"
        >
          <Image alt="trash" width={35} height={35} src="/images/Frame.svg" />
        </button>
        {
         showInitialSig && res.response.data.tandaTangan ? (
          <img
          onClick={() => setShowInitialSig(false)}
          style={{ touchAction: "none", width: "200px", height : "200px"  }}
          src={`data:image/png;base64,${res.response.data.tandaTangan.replaceAll('"', '')}`}
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
         )
        }
      </div>
    </div>
)}

export default SignaturePad