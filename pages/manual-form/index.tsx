import CustomFileInputField from "@/components/atoms/CustomFileInputField";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Label from "@/components/atoms/Label";
import TextInput from "@/components/atoms/TextInput";
import Footer from "@/components/Footer";
import ModalLayout from "@/components/layout/ModalLayout";
import { fileToBase64 } from "@/utils/fileToBase64";
import { handleRoute } from "@/utils/handleRoute";
import { onSubmitValidator } from "@/utils/onSubmitValidator";
import { assetPrefix } from "next.config";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import i18n from "i18";

type TForm = {
  nik: string;
  email: string;
  name: string;
  fileFotoKtp: string;
  fileFotoSelfie: string;
};

type TModal = {
  show: {
    ktp: boolean;
    selfie: boolean;
  };
  fileFotoKtpRef?: React.MutableRefObject<HTMLInputElement | null>;
  fileFotoSelfieRef?: React.MutableRefObject<HTMLInputElement | null>;
};

const Index = () => {
  const router = useRouter();
  const { t }: any = i18n;
  const fileFotoKtpRef = useRef<HTMLInputElement>(null);
  const fileFotoSelfieRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<TForm>({
    nik: "1234567890123456",
    email: "johndoe@yopmail.com",
    name: "John Doe",
    fileFotoKtp: "",
    fileFotoSelfie: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    nik: "",
    name: "",
    fileFotoKtp: "",
    fileFotoSelfie: "",
  });

  const [modal, setModal] = useState<TModal>({
    show: {
      ktp: false,
      selfie: false,
    },
    fileFotoKtpRef: useRef<HTMLInputElement>(null),
    fileFotoSelfieRef: useRef<HTMLInputElement>(null),
  });

  const resolutionChecker = (file: File | undefined) => {
    return new Promise((resolve) => {
      const img: HTMLImageElement = document.createElement("img");
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file as Blob);
    });
  };

  const onChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    const file: File = files?.[0] as File;
    const { width, height } = (await resolutionChecker(file)) as any;
    const isEligibleImage: boolean =
      files?.[0].type === "application/pdf" ||
      file.size > 202400 ||
      ((height < 200 || width < 200) && name === "fileFotoSelfie");

    const ref = {
      fileFotoKtpRef,
      fileFotoSelfieRef,
    };

    if (!isEligibleImage) {
      setForm({
        ...form,
        [name]:
          name === "fileFotoKtp" || name === "fileFotoSelfie"
            ? await fileToBase64(file)
            : name === "nik"
            ? value.replace(/\s/g, "")
            : value.trimStart(),
      });
      setErrorMessage({
        nik: "",
        name: "",
        fileFotoKtp: "",
        fileFotoSelfie: "",
      });
    } else {
      setErrorMessage((prev) => ({
        ...prev,
        [name]:
          name === "fileFotoKtp"
            ? t("manualForm.photoKtp.errorMessage2")
            : t("manualForm.photoSelfie.errorMessage2"),
      }));
    }

    setModal({
      ...modal,
      show: {
        ktp: false,
        selfie: false,
      },
      fileFotoKtpRef: ref.fileFotoKtpRef,
      fileFotoSelfieRef: ref.fileFotoSelfieRef,
    });
  };

  const onLabelClicked = (name: string) => {
    setModal({
      ...modal,
      show: {
        ktp: name === "fileFotoKtp" ? true : false,
        selfie: name === "fileFotoSelfie" ? true : false,
      },
      fileFotoKtpRef,
    });
  };

  const isShouldRedirectToOnProcessPage =
    errorMessage.fileFotoKtp.length < 1 &&
    errorMessage.fileFotoSelfie.length < 1 &&
    form.fileFotoKtp.length > 1 &&
    form.fileFotoSelfie.length > 1;

  const onsubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage({
      ...errorMessage,
      fileFotoKtp:
        (form.fileFotoKtp.length < 1 &&
          t("manualForm.photoKtp.errorMessage1")) ||
        errorMessage.fileFotoKtp,
      fileFotoSelfie:
        (form.fileFotoSelfie.length < 1 &&
          t("manualForm.photoSelfie.errorMessage1")) ||
        errorMessage.fileFotoSelfie,
    });

    if (isShouldRedirectToOnProcessPage) {
      router.push({
        pathname: handleRoute("manual-form/on-process"),
        query: { ...router.query },
      });
    }
  };

  const onDeleteImageHandler = (name: string) => {
    setForm({
      ...form,
      [name]: "",
    });
    setErrorMessage({
      ...errorMessage,
      [name]: "",
    });
  };

  return (
    <div className="px-5 pt-8 max-w-md poppins-regular mx-auto">
      <h1 className="text-lg font-bold">{t("manualForm.title")}</h1>
      <form onSubmit={onsubmitHandler}>
        <Label htmlFor="nik" title="NIK" isDisabled />
        <TextInput
          name="nik"
          placeholder={t("manualForm.nik.placeholder")}
          value={form.nik}
          onChangeHandler={onChangeHandler}
          isError={errorMessage.nik.length > 1}
          isDisabled
          isReadonly
        />
        <ErrorMessage errorMessage={errorMessage.nik} />
        <Label htmlFor="name" title={t("manualForm.name.label")} isDisabled />
        <TextInput
          name="name"
          placeholder={t("manualForm.name.placeholder")}
          value={form.name}
          onChangeHandler={onChangeHandler}
          isError={errorMessage.name.length > 1}
          isDisabled
          isReadonly
        />
        <ErrorMessage errorMessage={errorMessage.name} />
        <Label htmlFor="email" title={t("manualForm.email.label")} isDisabled />
        <TextInput
          name="email"
          placeholder={t("manualForm.email.placeholder")}
          value={form.email}
          onChangeHandler={onChangeHandler}
          isDisabled
          isReadonly
        />
        <CustomFileInputField
          name="fileFotoKtp"
          label={t("manualForm.photoKtp.label")}
          imageBase64={form.fileFotoKtp}
          errorMessage={errorMessage.fileFotoKtp}
          onDeleteImageHandler={onDeleteImageHandler}
          onChangeHandler={onChangeHandler}
          onLabelClicked={onLabelClicked}
          inputRef={fileFotoKtpRef}
          showMaxResolution={false}
        />
        <CustomFileInputField
          label={t("manualForm.photoSelfie.label")}
          name="fileFotoSelfie"
          errorMessage={errorMessage.fileFotoSelfie}
          imageBase64={form.fileFotoSelfie}
          onChangeHandler={onChangeHandler}
          onDeleteImageHandler={onDeleteImageHandler}
          onLabelClicked={onLabelClicked}
          inputRef={fileFotoSelfieRef}
          showMaxResolution
        />
        <button
          type="submit"
          className="bg-primary btn font-semibold text-white block mx-auto w-fit px-6 poppins-regular mb-5 mt-7 rounded-md h-10 hover:opacity-50"
        >
          {t("send")}
        </button>
      </form>
      <PhotoKtpTermModal fileFotoKtpRef={fileFotoKtpRef} show={modal.show} />
      <PhotoSelfieTermModal
        fileFotoSelfieRef={fileFotoSelfieRef}
        show={modal.show}
      />
      <Footer />
    </div>
  );
};

const PhotoKtpTermModal = ({ show, fileFotoKtpRef }: TModal) => {
  const { t }: any = i18n;

  useEffect(() => {
    if (show.ktp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [show.ktp]);

  return show.ktp ? (
    <ModalLayout>
      <div className="md:px-10 py-5">
        <h1 className="text-lg font-bold">
          {t("manualForm.photoKtp.termTitle")}
        </h1>
        <div className="text-center mt-5 max-w-md">
          <img
            src={`${assetPrefix}/images/ktpGuide.png`}
            width="100%"
            height="40px"
            alt="Photo e-KTP Term"
          />
        </div>
        <ul className="px-5 mt-10" style={{ listStyle: "initial" }}>
          <li>{t("manualForm.photoKtp.term1")}</li>
          <li className="mt-2">{t("manualForm.photoKtp.term2")}</li>
          <li className="mt-2">{t("manualForm.photoKtp.term3")}</li>
        </ul>
        <button
          onClick={() => fileFotoKtpRef?.current?.click()}
          type="button"
          className="bg-primary btn font-semibold text-white block ml-auto w-fit px-6 poppins-regular mb-5 mt-7 rounded-md h-10 hover:opacity-50"
        >
          {t("upload")}
        </button>
      </div>
    </ModalLayout>
  ) : null;
};

const PhotoSelfieTermModal = ({ show, fileFotoSelfieRef }: TModal) => {
  const { t }: any = i18n;

  useEffect(() => {
    if (show.selfie) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [show.selfie]);

  return show.selfie ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-center transition-all duration-1000 justify-center w-full left-0 top-0 h-full"
    >
      <div className="bg-white max-w-md pt-5 px-2 pb-3 rounded-md w-full ">
        <div className="md:px-10  py-3">
          <h1 className="text-lg font-bold">
            {t("manualForm.photoSelfie.termTitle")}
          </h1>
          <div className="text-center mt-5 max-w-md">
            <img
              src={`${assetPrefix}/images/selfieGuide.png`}
              width="100%"
              height="40px"
              alt="Photo e-KTP Term"
            />
          </div>
          <ul
            className="px-5 mt-10 text-sm md:text-base list-disc"
            style={{ listStyle: "initial !important" }}
          >
            <li>{t("manualForm.photoSelfie.term1")}</li>
            <li className="mt-2">{t("manualForm.photoSelfie.term2")}</li>
            <li className="mt-2">{t("manualForm.photoSelfie.term3")}</li>
            <li className="mt-2">{t("manualForm.photoSelfie.term4")}</li>
          </ul>
          <button
            onClick={() => fileFotoSelfieRef?.current?.click()}
            type="button"
            className="bg-primary btn font-semibold text-white block ml-auto w-fit px-6 poppins-regular mb-5 mt-7 rounded-md h-10 hover:opacity-50"
          >
            {t("upload")}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Index;
