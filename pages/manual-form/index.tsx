import CustomFileInputField from "@/components/atoms/CustomFileInputField";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Label from "@/components/atoms/Label";
import PreviewImage from "@/components/atoms/PreviewImage";
import TextInput from "@/components/atoms/TextInput";
import Footer from "@/components/Footer";
import { fileToBase64 } from "@/utils/fileToBase64";
import { handleRoute } from "@/utils/handleRoute";
import { onSubmitValidator } from "@/utils/onSubmitValidator";
import { useRouter } from "next/router";
import React, { useState } from "react";

type IForm = {
  nik: string;
  email: string;
  name: string;
  fileFotoKtp: string;
  fileFotoSelfie: string;
};

const Index = () => {
  const [form, setForm] = useState<IForm>({
    nik: "",
    email: "johndoe@yopmail.com",
    name: "",
    fileFotoKtp: "",
    fileFotoSelfie: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    nik: "",
    name: "",
    fileFotoKtp: "",
    fileFotoSelfie: "",
  });

  const router = useRouter();

  const onChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    setForm({
      ...form,
      [name]:
        name === "fileFotoKtp" || name === "fileFotoSelfie"
          ? await fileToBase64(files?.[0] as File)
          : name === "nik"
          ? value.trim()
          : value.trimStart(),
    });

    setErrorMessage((prev) => {
      const stateObj = { ...prev, [name]: "" };
      switch (name) {
        case "nik":
          if (!value) {
            stateObj[name] = "NIK wajib diisi";
          } else if (value.length > 0 && value.length < 16) {
            stateObj[name] = "NIK Harus 16 Digit";
          }
          break;
        case "name":
          if (!value) {
            stateObj[name] = "Name lengkap wajib diisi";
          }
        default:
          break;
      }
      return stateObj;
    });
  };

  const isShouldRedirectToOnProcessPage =
    errorMessage.fileFotoKtp.length < 1 &&
    errorMessage.fileFotoSelfie.length < 1 &&
    errorMessage.nik.length < 1 &&
    errorMessage.name.length < 1 &&
    form.fileFotoKtp.length > 1 &&
    form.fileFotoSelfie.length > 1 &&
    form.nik.length > 1 &&
    form.name.length > 1;

  const onsubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nikErrorMessage = onSubmitValidator.nikValidator(form.nik);
    setErrorMessage({
      ...errorMessage,
      nik: nikErrorMessage,
      name: onSubmitValidator.requiredInput(form.name, "Nama Lengkap", "diisi"),
      fileFotoKtp: onSubmitValidator.requiredInput(
        form.name,
        "Foto e-KTP",
        "diunggah"
      ),
      fileFotoSelfie: onSubmitValidator.requiredInput(
        form.name,
        "Foto selfie",
        "diunggah"
      ),
    });

    if (isShouldRedirectToOnProcessPage && !nikErrorMessage) {
      router.push({
        pathname: handleRoute("manual-form/on-process"),
        ...router.query,
      });
    }
  };

  const onDeleteImageHandler = (name: string) => {
    setForm({
      ...form,
      [name]: "",
    });
  };

  return (
    <div className="px-5 pt-8 max-w-md poppins-regular mx-auto">
      <h1 className="text-lg font-bold">Verifikasi Manual</h1>
      <form onSubmit={onsubmitHandler}>
        <Label htmlFor="nik" title="NIK" />
        <TextInput
          name="nik"
          placeholder="Masukkan Nomor e-KTP"
          value={form.nik}
          onChangeHandler={onChangeHandler}
          isError={errorMessage.nik.length > 1}
        />
        <ErrorMessage errorMessage={errorMessage.nik} />
        <Label htmlFor="name" title="Name" />
        <TextInput
          name="name"
          placeholder="Masukkan Nama Lengkap Sesuai e-KTP"
          value={form.name}
          onChangeHandler={onChangeHandler}
          isError={errorMessage.name.length > 1}
        />
        <ErrorMessage errorMessage={errorMessage.name} />
        <Label htmlFor="email" title="Email" isDisabled />
        <TextInput
          name="email"
          placeholder="Masukkan Email"
          value={form.email}
          onChangeHandler={onChangeHandler}
          isDisabled
          isReadonly
        />
        <CustomFileInputField
          onChangeHandler={onChangeHandler}
          name="fileFotoKtp"
          errorMessage={errorMessage.fileFotoKtp}
          label="e-KTP"
          imageBase64={form.fileFotoKtp}
          onDeleteImageHandler={onDeleteImageHandler}
        />
        <CustomFileInputField
          onChangeHandler={onChangeHandler}
          name="fileFotoSelfie"
          errorMessage={errorMessage.fileFotoSelfie}
          label="Selfie"
          imageBase64={form.fileFotoSelfie}
          onDeleteImageHandler={onDeleteImageHandler}
        />
        <button
          type="submit"
          className="bg-primary btn font-semibold text-white block mx-auto w-fit px-6 poppins-regular mb-5 mt-7 rounded-md h-10 hover:opacity-50"
        >
          Lanjut
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default Index;
