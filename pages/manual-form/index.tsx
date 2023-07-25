import CustomFileInputField from "@/components/atoms/CustomFileInputField";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Label from "@/components/atoms/Label";
import TextInput from "@/components/atoms/TextInput";
import Footer from "@/components/Footer";
import ModalLayout from "@/components/layout/ModalLayout";
import { fileToBase64 } from "@/utils/fileToBase64";
import { handleRoute } from "@/utils/handleRoute";
import { inputValidator } from "@/utils/inputValidator";
import { assetPrefix } from "next.config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/legacy/image";
import i18n from "i18";
import { RestPersonalPManualReg } from "infrastructure";
import { TPersonalPManualRegRequestData } from "infrastructure/rest/personal/types";
import XIcon from "@/public/icons/XIcon";
import Button from "@/components/atoms/Button";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

type TForm = {
  nik: string;
  email: string;
  name: string;
  photo_ktp: string;
  photo_selfie: string;
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
  const { request_id, ...restRouterQuery } = router.query;
  const { t }: any = i18n;
  const fileFotoKtpRef = useRef<HTMLInputElement>(null);
  const fileFotoSelfieRef = useRef<HTMLInputElement>(null);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const [form, setForm] = useState<TForm>({
    nik: "",
    email: "",
    name: "",
    photo_ktp: "",
    photo_selfie: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    nik: "",
    name: "",
    email: "",
    photo_ktp: "",
    photo_selfie: "",
  });

  const [modal, setModal] = useState<TModal>({
    show: {
      ktp: false,
      selfie: false,
    },
    fileFotoKtpRef: useRef<HTMLInputElement>(null),
    fileFotoSelfieRef: useRef<HTMLInputElement>(null),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resolutionChecker = (file: File | undefined) => {
    return new Promise((resolve) => {
      const img: HTMLImageElement = document.createElement("img");
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = URL.createObjectURL(file as Blob);
    });
  };

  const onChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let isErrorImage: boolean = false;
    let isEligibleFileType: boolean = true;
    const { value, name, files } = e.target;
    const file: File = files?.[0] as File;
    if (name === "photo_ktp" || name === "photo_selfie") {
      const fileType = ["jpg", "jpeg", "png"];
      isEligibleFileType = fileType.some((el) => file?.name.includes(el));

      if (isEligibleFileType) {
        const { width, height } = (await resolutionChecker(file)) as any;
        isErrorImage =
          file.size > 2000000 ||
          ((height < 200 || width < 200) && name === "photo_selfie");
      }
    }

    setForm({
      ...form,
      [name]:
        name === "photo_ktp" || name === "photo_selfie"
          ? await fileToBase64(file)
          : name === "nik"
          ? value.replace(/[^0-9]/g, "")
          : name === "email"
          ? value.replace(/\s/g, "")
          : name === "name"
          ? value.trimStart()
          : "",
    });

    const ref = {
      fileFotoKtpRef,
      fileFotoSelfieRef,
    };

    setErrorMessage((prev) => {
      const stateObj = { ...prev, [name]: "" };
      switch (name) {
        case "photo_ktp":
          if (!isEligibleFileType) {
            stateObj[name] = t("manualForm.photoKtp.errorMessage2");
            setForm({
              ...form,
              ["photo_ktp"]: "",
            });
          }
          break;
        case "photo_selfie":
          if (isErrorImage || !isEligibleFileType) {
            stateObj[name] = t("manualForm.photoSelfie.errorMessage2");
            setForm({
              ...form,
              ["photo_selfie"]: "",
            });
          }
          break;
        case "nik":
          stateObj[name] = inputValidator.nikValidator(value);
        default:
          break;
      }

      return stateObj;
    });

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
        ktp: name === "photo_ktp" ? true : false,
        selfie: name === "photo_selfie" ? true : false,
      },
      fileFotoKtpRef,
    });
  };

  const onsubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage({
      ...errorMessage,
      photo_ktp: inputValidator.requiredInput(
        form.photo_ktp,
        t("manualForm.photoKtp.errorMessage1")
      ),
      photo_selfie: inputValidator.requiredInput(
        form.photo_selfie,
        t("manualForm.photoSelfie.errorMessage1")
      ),
      nik: inputValidator.requiredInput(
        form.nik,
        t("manualForm.nik.errorMessage1")
      ),
      name: inputValidator.requiredInput(
        form.name,
        t("manualForm.name.errorMessage1")
      ),
      email: inputValidator.requiredInput(
        form.email,
        t("manualForm.email.errorMessage1")
      ),
    });

    const isFormEmpty = Object.values(form).some((x) => x === "");
    const isErrorMessageEmpty = Object.values(errorMessage).some(
      (x) => x === ""
    );

    if (isFormEmpty || !isErrorMessageEmpty) return;

    toast(`Loading...`, {
      type: "info",
      toastId: "load",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });

    try {

      setIsLoading(true);
      const formReq: TPersonalPManualRegRequestData = {
        ...form,
        register_id: request_id as string,
      };
      const res = await RestPersonalPManualReg(formReq);
      if (!res.success) {
        setIsLoading(false);
        toast.dismiss();
        return toast.error(res.message || "gagal", { icon: <XIcon /> });
      }

      const query: any = {
        ...restRouterQuery,
        request_id,
        token: res.token,
      };

      if (res.channel_type === "REGULAR") {
        toast.dismiss();
        router.push({
          pathname: handleRoute("manual-form/final"),
          query,
        });
      } else {
        toast.dismiss();
        router.push({
          pathname: handleRoute("manual-form/on-process"),
          query: { ...router.query },
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.dismiss();
      if (err.response?.data?.data?.errors?.[0]) {
        toast.error(
          `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
          { icon: <XIcon /> }
        );
      } else {
        toast.error(err.response?.data?.message || "gagal", {
          icon: <XIcon />,
        });
      }
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
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
    >
      <div className="px-5 pt-8 max-w-md mx-auto">
        <Heading>{t("manualForm.title")}</Heading>
        <form onSubmit={onsubmitHandler}>
          <Label className="ml-3 mt-5" size="base" htmlFor="nik">
            NIK
          </Label>
          <TextInput
            name="nik"
            placeholder={t("manualForm.nik.placeholder")}
            value={form.nik}
            onChangeHandler={onChangeHandler}
            isError={errorMessage.nik.length > 1}
          />
          <ErrorMessage errorMessage={errorMessage.nik} />
          <Label className="ml-3 mt-3" size="base" htmlFor="name">
            {t("manualForm.name.label")}
          </Label>
          <TextInput
            name="name"
            placeholder={t("manualForm.name.placeholder")}
            value={form.name}
            onChangeHandler={onChangeHandler}
            isError={errorMessage.name.length > 1}
          />
          <ErrorMessage errorMessage={errorMessage.name} />
          <Label className="ml-3 mt-3" size="base" htmlFor="email">
            {t("manualForm.email.label")}
          </Label>
          <TextInput
            name="email"
            placeholder={t("manualForm.email.placeholder")}
            value={form.email}
            onChangeHandler={onChangeHandler}
            isError={errorMessage.email.length > 1}
          />
          <ErrorMessage errorMessage={errorMessage.email} />
          <CustomFileInputField
            name="photo_ktp"
            label={t("manualForm.photoKtp.label")}
            imageBase64={form.photo_ktp}
            errorMessage={errorMessage.photo_ktp}
            onDeleteImageHandler={onDeleteImageHandler}
            onChangeHandler={onChangeHandler}
            onLabelClicked={onLabelClicked}
            inputRef={fileFotoKtpRef}
            showMaxResolution={false}
          />
          <CustomFileInputField
            label={t("manualForm.photoSelfie.label")}
            name="photo_selfie"
            errorMessage={errorMessage.photo_selfie}
            imageBase64={form.photo_selfie}
            onChangeHandler={onChangeHandler}
            onDeleteImageHandler={onDeleteImageHandler}
            onLabelClicked={onLabelClicked}
            inputRef={fileFotoSelfieRef}
            showMaxResolution
          />

          <Button
            type="submit"
            disabled={errorMessage.nik.length > 1 || isLoading}
            size="sm"
            className="bg-primary btn font-semibold mt-7 h-9 hover:opacity-50"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
          >
            {t("send")}
          </Button>
        </form>
        <PhotoKtpTermModal fileFotoKtpRef={fileFotoKtpRef} show={modal.show} />
        <PhotoSelfieTermModal
          fileFotoSelfieRef={fileFotoSelfieRef}
          show={modal.show}
        />
        <Footer />
      </div>
    </div>
  );
};

const PhotoKtpTermModal = ({ show, fileFotoKtpRef }: TModal) => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

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
        <Heading className="text-lg font-bold">
          {t("manualForm.photoKtp.termTitle")}
        </Heading>
        <div className="flex justify-center gap-12">
          <div>
            <div
              className="bg-contain w-32 mx-auto mt-5 h-32 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                  themeConfiguration.data.asset_manual_form_ektp_ok as string,
                  "ASSET",
                  `${assetPrefix}/images/ktp.png`
                )})`,
              }}
            ></div>
            <div
              className="bg-contain w-10 mx-auto mt-5 h-10 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${assetPrefix}/images/Right.svg)`,
              }}
            ></div>
          </div>
          <div>
            <div
              className="bg-contain w-32 mx-auto mt-5 h-32 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                  themeConfiguration.data
                    .asset_manual_form_ektp_not_ok as string,
                  "ASSET",
                  `${assetPrefix}/images/wrong-ktp.png`
                )})`,
              }}
            ></div>
            <div
              className="bg-contain w-10 mx-auto mt-5 h-10 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${assetPrefix}/images/Wrong.svg)`,
              }}
            ></div>
          </div>
        </div>
        <ul className="px-5 mt-10" style={{ listStyle: "initial" }}>
          <li>
            <Paragraph>{t("manualForm.photoKtp.term1")}</Paragraph>
          </li>
          <li className="mt-2">
            <Paragraph>{t("manualForm.photoKtp.term2")}</Paragraph>
          </li>
          <li className="mt-2">
            <Paragraph>{t("manualForm.photoKtp.term3")}</Paragraph>
          </li>
        </ul>
        <Button
          type="button"
          className="font-semibold mt-7 h-9 flex mr-0"
          size="lg"
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
          }}
          onClick={() => fileFotoKtpRef?.current?.click()}
        >
          {t("upload")}
        </Button>
      </div>
    </ModalLayout>
  ) : null;
};

const PhotoSelfieTermModal = ({ show, fileFotoSelfieRef }: TModal) => {
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

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
          <Heading className="text-lg font-bold">
            {t("manualForm.photoSelfie.termTitle")}
          </Heading>
          <div className="flex justify-center gap-12">
            <div>
              <div
                className="bg-contain w-32 mx-auto mt-5 h-32 bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                    themeConfiguration.data
                      .asset_manual_form_selfie_ok as string,
                    "ASSET",
                    `${assetPrefix}/images/selfie.png`
                  )})`,
                }}
              ></div>
              <div
                className="bg-contain w-10 mx-auto mt-5 h-10 bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${assetPrefix}/images/Right.svg)`,
                }}
              ></div>
            </div>
            <div>
              <div
                className="bg-contain w-32 mx-auto mt-5 h-32 bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                    themeConfiguration.data
                      .asset_manual_form_selfie_not_ok as string,
                    "ASSET",
                    `${assetPrefix}/images/wrong-selfie.png`
                  )})`,
                }}
              ></div>
              <div
                className="bg-contain w-10 mx-auto mt-5 h-10 bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${assetPrefix}/images/Wrong.svg)`,
                }}
              ></div>
            </div>
          </div>
          <ul
            className="px-5 mt-10 text-sm md:text-base list-disc"
            style={{ listStyle: "initial !important" }}
          >
            <li>
              <Paragraph>{t("manualForm.photoSelfie.term1")}</Paragraph>
            </li>
            <li className="mt-2">
              <Paragraph>{t("manualForm.photoSelfie.term2")}</Paragraph>
            </li>
            <li className="mt-2">
              <Paragraph>{t("manualForm.photoSelfie.term3")}</Paragraph>
            </li>
            <li className="mt-2">
              <Paragraph>{t("manualForm.photoSelfie.term4")}</Paragraph>
            </li>
          </ul>
          <Button
            type="button"
            className="font-semibold mt-7 h-9 flex mr-0"
            size="lg"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
            onClick={() => fileFotoSelfieRef?.current?.click()}
          >
            {t("upload")}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Index;
