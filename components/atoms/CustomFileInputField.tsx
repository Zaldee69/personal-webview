import i18n from "i18";
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
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImageHandler: (name: string) => void;
  onLabelClicked: (name: string) => void;
};

const CustomFileInputField = ({
  label,
  errorMessage,
  name,
  imageBase64,
  inputRef,
  onChangeHandler,
  onDeleteImageHandler,
  onLabelClicked,
}: Props) => {

  const {t}: any = i18n

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
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/jpg, image/jpeg, image/png"
            onChange={onChangeHandler}
          />
          <div
            onClick={() => onLabelClicked(name)}
            className={`w-full rounded-md cursor-pointer ${
              errorMessage.length > 1
                ? "input-file-style__error"
                : "input-file-style"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 py-10 ">
              <Image
                src={`${assetPrefix}/images/sitemap.svg`}
                height={50}
                width={50}
                alt="sitemap"
              />
              <p className="text-label block font-semibold">
              {t("upload")} {label}
              </p>
              <p className="text-placeholder text-center mb-0">
                Max. 2MB (.jpg/.jpeg/.png) <br /> {t("manualForm.resolutionMinimum")}
              </p>
            </div>
          </div>
          <ErrorMessage errorMessage={errorMessage} />
        </>
      )}
    </>
  );
};

export default CustomFileInputField;
