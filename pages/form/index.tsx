import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import { RestKycCheckStep, RestKycCheckStepv2, RestKycFinalForm } from "../../infrastructure";
import EyeIcon from "../../public/icons/EyeIcon";
import EyeIconOff from "./../../public/icons/EyeIconOff";
import QuestionIcon from "./../../public/icons/QuestionIcon";
import Head from "next/head";
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";
import i18n from "i18";
import { assetPrefix } from "../../next.config";
import { handleRoute } from "@/utils/handleRoute";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Label from "@/components/atoms/Label";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
interface InputType {
  password: string | number;
  confirmPassword: string | number;
  tilakaName: string | number;
}

interface ErrorType {
  password: string;
  confirmPassword: string;
  tilakaName: string;
}

interface Type {
  password: string;
  confirmPassword: string;
}

const Form: React.FC = () => {
  const router = useRouter();
  const { request_id, ...restRouterQuery } = router.query;
  const [input, setInput] = useState<InputType>({
    password: "",
    confirmPassword: "",
    tilakaName: "",
  });

  const[isLoading, setIsLoading] = useState<boolean>(false)

  const [error, setError] = useState<ErrorType>({
    password: "",
    confirmPassword: "",
    tilakaName: "",
  });

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const [type, setType] = useState<Type>({
    password: "password",
    confirmPassword: "password",
  });

  const { t }: any = i18n;

  const [isChecked, setIsCheked] = useState<boolean>(false);
  const disabled =
    !input.password ||
    !input.confirmPassword ||
    !input.tilakaName ||
    error.tilakaName ||
    error.confirmPassword ||
    error.password ||
    !isChecked || isLoading;

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "tnc") {
      setIsCheked(e.target.checked);
      console.log(e.target.checked);
    } else {
      setInput((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError((prev) => {
      const stateObj = { ...prev, [name]: "" };

      switch (name) {
        case "tilakaName":
          if (!value) {
            stateObj[name] = t("tilakaNameErrorRequired");
          } else if (
            !/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z_]{6,15}$/.test(value)
          ) {
            stateObj[name] = t("tilakaNameWrongFormat");
          }
          break;

        case "password":
          if (!value) {
            stateObj[name] = t("passwordRequired");
          } else if (
            !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])[0-9a-zA-Z@#$%^&+=]{10,40}$/.test(
              value
            )
          ) {
            stateObj[name] = t("passwordWrongFormat");
          } else if (input.password && value !== input.confirmPassword) {
            stateObj["confirmPassword"] = t("passwordNotMatch");
          } else {
            stateObj["confirmPassword"] = input.confirmPassword
              ? ""
              : error.confirmPassword;
          }
          break;

        case "confirmPassword":
          if (!value) {
            stateObj[name] = t("passwordConfirmationRequired");
          } else if (
            !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])[0-9a-zA-Z@#$%^&+=]{10,40}$/
          ) {
            stateObj[name] = t("passwordWrongFormat");
          } else if (input.password && value !== input.password) {
            stateObj[name] = t("passwordNotMatch");
          }
          break;

        default:
          break;
      }

      return stateObj;
    });
  };
  const handleShowPwd = (
    types: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    switch (types) {
      case "password":
        setType((prev) => ({
          ...prev,
          password: type.password === "password" ? "text" : "password",
        }));
        break;

      case "confirmPassword":
        setType((prev) => ({
          ...prev,
          confirmPassword:
            type.confirmPassword === "password" ? "text" : "password",
        }));
    }
  };
  const onSubmitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true)
    toast(`Loading...`, {
      type: "info",
      toastId: "load",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });
    const target = e.target as typeof e.target & {
      tilakaName: { value: string };
      password: { value: string };
    };
    const tilakaName = target.tilakaName.value;
    const password = target.password.value;

    RestKycFinalForm({
      payload: { tilakaName, password, registerId: request_id as string },
    })
      .then((res) => {
        if (res.success) {
          toast.dismiss();
          toast.success(res?.message || "berhasil", {
            icon: <CheckOvalIcon />,
          });

          const query: any = {
            request_id,
            ...restRouterQuery,
          };

          if (res.data.reason_code) {
            query.reason_code = res.data.reason_code;

            if (res.data.reason_code === "1") {
              return router.replace({
                pathname: handleRoute("liveness-failure"),
                query,
              });
            }
          }

          router.replace({
            pathname: handleRoute("form/success"),
            query,
          });
        } else {
          toast.dismiss();
          setIsLoading(false)
          toast.error(res?.message || "gagal", { icon: <XIcon /> });
        }
      })
      .catch((err) => {
        toast.dismiss();
        setIsLoading(false)
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
      <Head>
        <title>{t("finalFormTitle")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-md mx-auto">
        <Heading>{t("finalFormTitle")}</Heading>
        <div
          className="bg-contain w-52 mx-auto h-64 my-3 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
              themeConfiguration.data.asset_registration_final_form as string,
              "ASSET",
              `${assetPrefix}/images/form.svg`
            )})`,
          }}
        ></div>
        <Paragraph className=" text-left block mt-5">
          {t("finalFormSubtitle")}
        </Paragraph>
        <form autoComplete="off" className="mt-10" onSubmit={onSubmitHandler}>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Label
                size="base"
                className="px-2 text-label"
                htmlFor="tilakaName"
              >
                Tilaka Name
              </Label>
              <div className="relative flex flex-col items-center group">
                <QuestionIcon />
                <div className="absolute left-9 -top-10  w-48   flex-col items-center hidden mb-6 group-hover:flex">
                  <span className="relative z-10 p-2 text-xs rounded-md  w-full text-white whitespace-no-wrap bg-neutral shadow-lg">
                    {t("finalFormTooltip")}
                  </span>
                  <div className="w-3 h-3 -mt-16 mr-48 rotate-45 bg-neutral"></div>
                </div>
              </div>
            </div>

            <input
              tabIndex={1}
              onChange={(e) => onChangeHandler(e)}
              name="tilakaName"
              autoComplete="off"
              type="text"
              placeholder={t("tilakaNamePlaceHolder")}
              className={` py-3 focus:outline-none font-poppins placeholder:text-placeholder placeholder:font-light   px-2 rounded-md border border-borderColor ${
                error.tilakaName
                  ? "border-error "
                  : "border-borderColor focus:ring"
              }`}
            />
            <ErrorMessage errorMessage={error.tilakaName} />
          </div>
          <div className="flex flex-col mt-5">
            <Label size="base" className="px-2" htmlFor="password">
              {t("passwordLabel")}
            </Label>
            <div className="relative">
              <input
                tabIndex={3}
                onChange={(e) => onChangeHandler(e)}
                name="password"
                type={type.password}
                placeholder={t("passwordPlaceholder")}
                className={` py-3 focus:outline-none font-poppins placeholder:text-placeholder placeholder:font-light  px-2 rounded-md border  w-full ${
                  error.password
                    ? "border-error "
                    : "border-borderColor focus:ring"
                }`}
                autoComplete="off"
              />
              <button
                onClick={(e) => handleShowPwd("password", e)}
                className="absolute right-3 top-3"
                type="button"
              >
                {type.password === "password" ? <EyeIcon /> : <EyeIconOff />}
              </button>
              <ErrorMessage errorMessage={error.password} />
            </div>
          </div>
          <div className="flex flex-col mt-5">
            <Label className="px-2" size="base" htmlFor="retype-password">
              {t("passwordConfirmationLabel")}
            </Label>
            <div className="relative">
              <input
                tabIndex={3}
                onChange={(e) => onChangeHandler(e)}
                name="confirmPassword"
                type={type.confirmPassword}
                placeholder={t("passwordConfirmationPlaceholder")}
                className={` py-3 focus:outline-none font-poppins  placeholder:text-placeholder placeholder:font-light  px-2 rounded-md border border-borderColor w-full ${
                  error.confirmPassword
                    ? "border-error "
                    : "border-borderColor focus:ring"
                } `}
              />
              <button
                onClick={(e) => handleShowPwd("confirmPassword", e)}
                className="absolute right-3 top-3"
                type="button"
              >
                {type.confirmPassword === "password" ? (
                  <EyeIcon />
                ) : (
                  <EyeIconOff />
                )}
              </button>
              <ErrorMessage errorMessage={error.confirmPassword} />
            </div>
          </div>
          <div className="flex flex-row mt-5 gap-1">
            <input
              tabIndex={4}
              id="tnc"
              name="tnc"
              type="checkbox"
              className=" border-borderColor"
              onChange={onChangeHandler}
            />
            <Label htmlFor="tnc">
              {t("agree")}{" "}
              <span className="text-primary">
                <a
                  href="https://repository.tilaka.id/CP_CPS.pdf"
                  target="blank"
                >
                  CP/CPS
                </a>
                ,{" "}
                <a
                  href="https://repository.tilaka.id/kebijakan-jaminan.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("warranty")}
                </a>
                ,{" "}
                <a
                  href="https://repository.tilaka.id/kebijakan-privasi.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("privacy")}
                </a>
                ,{" "}
              </span>
              {t("and")}
              <a
                target="blank"
                href="https://repository.tilaka.id/perjanjian-pemilik-sertifikat.pdf"
                className="text-primary"
              >
                {" "}
                {t("certificate")}
              </a>
            </Label>
          </div>
          <Button
            disabled={disabled as boolean}
            type="submit"
            style={{
              backgroundColor: themeConfigurationAvaliabilityChecker(
                themeConfiguration?.data.button_color as string
              ),
            }}
            className="mt-10 p-2.5 block mx-auto"
            size="none"
          >
            {t("finalFormTitle")}
          </Button>
        </form>
        <Footer />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;

  const checkStepResult: {
    res?: TKycCheckStepResponseData;
    err?: {
      response: {
        data: {
          success: boolean;
          message: string;
          data: { errors: string[] };
        };
      };
    };
  } = await RestKycCheckStepv2({
    registerId: uuid as string,
  })
    .then((res) => {
      return { res };
    })
    .catch((err) => {
      return { err };
    });

  return serverSideRenderReturnConditions({ context, checkStepResult });
};

export default Form;
