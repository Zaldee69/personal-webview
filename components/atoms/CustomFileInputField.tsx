import i18n from "i18";
import { assetPrefix } from "next.config";
import Image from "next/legacy/image";
import React from "react";
import ErrorMessage from "./ErrorMessage";
import Label from "./Label";
import PreviewImage from "./PreviewImage";
import Paragraph from "./Paraghraph";

type Props = {
  label: string;
  errorMessage: string;
  name: string;
  imageBase64: string;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  showMaxResolution: boolean;
  placeholder?: string;
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
  showMaxResolution,
  placeholder,
  onChangeHandler,
  onDeleteImageHandler,
  onLabelClicked,
}: Props) => {
  const { t }: any = i18n;

  return (
    <>
      <Label className="ml-3 mt-3" size="base" htmlFor={name}>
        {label}
      </Label>
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
              <Paragraph className="text-label block font-semibold">
                {t("upload")} {label}
              </Paragraph>
              <Label
                htmlFor=""
                className="text-placeholder cursor-pointer text-center mb-0 whitespace-pre-line"
              >
                {showMaxResolution && (
                  <span className="block">
                    {t("manualForm.resolutionMinimum")}
                  </span>
                )}
                <span>{placeholder}</span>
              </Label>
            </div>
          </div>
          <ErrorMessage errorMessage={errorMessage} />
        </>
      )}
    </>
  );
};

export default CustomFileInputField;
