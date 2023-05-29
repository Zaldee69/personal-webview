import { assetPrefix } from "next.config";
import Image from "next/legacy/image";
import React from "react";

type Props = {
  imageBase64: string;
  name: string;
  onDeleteImageHandler: (name: string) => void;
};

const PreviewImage = ({ imageBase64, onDeleteImageHandler, name }: Props) => {
  return (
    <div className="w-full bg-neutral50 rounded-md flex justify-center items-center relative h-[202px] ">
      <button
        type="button"
        onClick={() => onDeleteImageHandler(name)}
        style={{ padding: "4px 7px 2px 7px" }}
        className="bg-neutral200 rounded-full right-5 top-5 absolute"
      >
        <Image src={`${assetPrefix}/images/trash.svg`} height={15} width={15} alt="trash" />
      </button>
      <img
        className="rounded-md"
        style={{ height: "inherit" }}
        alt="imageKtp"
        src={imageBase64}
      />
    </div>
  );
};

export default PreviewImage;
