import { assetPrefix } from "next.config";
import Image from "next/image";
import React from "react";
import ErrorMessage from "./ErrorMessage";
import Label from "./Label";
import PreviewImage from "./PreviewImage";

type Props = {
  label: string;
  errorMessage: string;
  name: string;
  imageBase64: string;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImageHandler: (name: string) => void;
};

const CustomFileInputField = ({
  label,
  errorMessage,
  name,
  imageBase64,
  onChangeHandler,
  onDeleteImageHandler,
}: Props) => {
  return (
    <>
      <Label title={label} />
      {imageBase64 ? (
        <PreviewImage
          name={name}
          onDeleteImageHandler={onDeleteImageHandler}
          imageBase64={imageBase64}
        />
      ) : (
        <>
          <input
            name={name}
            id={name}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={onChangeHandler}
          />
          <label htmlFor={name}>
            <div
              className={`w-full rounded-md cursor-pointer ${
                errorMessage.length > 1 ? "input-file-style__error" : "input-file-style"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3 py-10 ">
                <Image
                  src={`${assetPrefix}/images/sitemap.svg`}
                  height={50}
                  width={50}
                  alt="sitemap"
                />
                <p className="text-label block font-semibold">Unggah Foto {label}</p>
                <p className="text-placeholder">Max. 4MB (.jpg/.jpeg/.png)</p>
              </div>
            </div>
          </label>
          <ErrorMessage errorMessage={errorMessage} />
        </>
      )}
    </>
  );
};

export default CustomFileInputField;
