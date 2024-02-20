import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { assetPrefix } from "next.config";
import i18n from "i18";
import { RootState } from "@/redux/app/store";
import { fileToBase64 } from "@/utils/fileToBase64";
import { handleRoute } from "@/utils/handleRoute";
import { inputValidator } from "@/utils/inputValidator";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import XIcon from "@/public/icons/XIcon";
import {
  RestPersonalPManualReg,
  RestPersonalPManualRegV2,
} from "infrastructure";
import { TPersonalPManualRegRequestData } from "infrastructure/rest/personal/types";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";

import Button from "@/components/atoms/Button";
import CustomFileInputField from "@/components/atoms/CustomFileInputField";
import Footer from "@/components/Footer";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

type TForm = {
  photo_selfie: string;
};

type TModal = {
  show: {
    selfie: boolean;
  };
  fileFotoSelfieRef?: React.MutableRefObject<HTMLInputElement | null>;
};

type Props = {
  checkStepResultDataRoute: TKycCheckStepResponseData["data"]["route"];
  nationalityType: TKycCheckStepResponseData["data"]["nationality_type"];
};

const MIN_FILE_SIZE = (1024 * 1024) / 2;
const MIN_RESOLUTION = 200;

const Manual = (props: Props) => {
  const router = useRouter();
  const { request_id, ...restRouterQuery } = router.query;
  const { t }: any = i18n;
  const fileFotoKtpRef = useRef<HTMLInputElement>(null);
  const fileFotoSelfieRef = useRef<HTMLInputElement>(null);
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const [form, setForm] = useState<TForm>({
    photo_selfie: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    photo_selfie: "",
  });

  const [modal, setModal] = useState<TModal>({
    show: {
      selfie: false,
    },
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
    let isSizeLessThan1Mb: boolean = false;
    let isRatioLessThan200Px: boolean = false;
    let isEligibleFileType: boolean = true;
    const { value, name, files } = e.target;
    const file: File = files?.[0] as File;
    if (name === "photo_ktp" || name === "photo_selfie") {
      const fileType = ["jpg", "jpeg", "png"];
      isEligibleFileType = fileType.some((el) =>
        file?.name.toLowerCase().includes(el)
      );

      if (isEligibleFileType) {
        const { width, height } = (await resolutionChecker(file)) as any;
        isSizeLessThan1Mb = file.size < MIN_FILE_SIZE;
        isRatioLessThan200Px =
          (height < MIN_RESOLUTION || width < MIN_RESOLUTION) &&
          name === "photo_selfie";
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
      const stateObj: any = { ...prev, [name]: "" };

      if (!isEligibleFileType) {
        fileFotoKtpRef.current?.value;
        stateObj[name] = t("manualForm.invalidFileType");
        setForm({
          ...form,
          [name]: "",
        });
      } else if (isRatioLessThan200Px) {
        stateObj[name] = t("manualForm.InvalidResolution");
        setForm({
          ...form,
          [name]: "",
        });
      }

      return stateObj;
    });

    setModal({
      ...modal,
      show: {
        selfie: false,
      },
      fileFotoSelfieRef: ref.fileFotoSelfieRef,
    });
  };

  const onLabelClicked = (name: string) => {
    setModal({
      ...modal,
      show: {
        selfie: name === "photo_selfie" ? true : false,
      },
    });
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage({
      ...errorMessage,
      photo_selfie: inputValidator.requiredInput(
        form.photo_selfie,
        t("manualForm.photoSelfie.errorMessage1")
      ),
    });

    if (form.photo_selfie.length < 1) return;

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
      const formReq = {
        photo_selfie: form.photo_selfie,
        register_id: request_id as string,
      };

      const res = await RestPersonalPManualRegV2(formReq);
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

      if (
        res.channel_type === "REGULAR" &&
        props.checkStepResultDataRoute !== "manual_form"
      ) {
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
        <form onSubmit={onSubmitHandler}>
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
            placeholder="(.jpg/.jpeg/.png)"
          />

          <Button
            type="submit"
            disabled={isLoading && props.nationalityType !== "WNA"}
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
        <PhotoSelfieTermModal
          fileFotoSelfieRef={fileFotoSelfieRef}
          show={modal.show}
        />
        <Footer />
      </div>
    </div>
  );
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

export default Manual;
