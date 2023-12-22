import { Viewer } from "@/components/Viewer";
import { useDispatch, useSelector } from "react-redux";
import { getDocument } from "@/redux/slices/documentSlice";
import { addFont, addScratch } from "@/redux/slices/signatureSlice";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/redux/app/store";
import { TDocumentProps } from "@/interface/interface";
import { PinInput } from "react-input-pin-code";
import { restSigning } from "infrastructure/rest/signing";
import { restLogout } from "infrastructure/rest/b2b";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { restGetOtp } from "infrastructure/rest/b2b";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import Image from "next/legacy/image";
import Head from "next/head";
import FRCamera from "@/components/FRCamera";
import SignaturePad from "@/components/SignaturePad";
import Footer from "@/components/Footer";
import html2canvas from "html2canvas";
import { getUserName } from "infrastructure/rest/b2b";
import { assetPrefix } from "../../next.config";
import { handleRoute } from "./../../utils/handleRoute";
import { GetServerSideProps } from "next";
import { TKycCheckStepResponseData } from "infrastructure/rest/kyc/types";
import { serverSideRenderReturnConditions } from "@/utils/serverSideRenderReturnConditions";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import Loading from "@/components/Loading";
import { RestKycCheckStepv2 } from "infrastructure/rest/personal";
import {
  getStorageWithExpiresIn,
  removeStorageWithExpiresIn,
} from "@/utils/localStorageWithExpiresIn";
import Button from "@/components/atoms/Button";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

type TFontSig =
  | "Adine-Kirnberg"
  | "champignonaltswash"
  | "FormalScript"
  | "HerrVonMuellerhoff-Regular"
  | "MrsSaintDelafield-Regular"
  | "SCRIPTIN";

interface Active {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
  tilakaName?: string;
}

const Signing = () => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [openScratchesModal, setOpenScratchesModal] = useState<boolean>(false);
  const [selectFontModal, setSelectFontModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const [data, setData] = useState<string>();
  const router = useRouter();
  const routerIsReady = router.isReady;
  const { company_id, request_id, transaction_id } = router.query;

  const dispatch: AppDispatch = useDispatch();
  const res = useSelector((state: RootState) => state.document);
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (!routerIsReady) return;

    const token = getStorageWithExpiresIn("token", handleRoute("login"), {
      ...router.query,
    });
    const count = parseInt(localStorage.getItem("count") as string);
    localStorage.setItem("count", count ? count.toString() : "0");

    getUserName({}).then((res) => {
      const data = JSON.parse(res.data);
      setData(data.name);
    });
    dispatch(
      getDocument({
        company_id,
        transaction_id: (request_id as string) || (transaction_id as string),
        token,
      } as TDocumentProps)
    );
    if (res.response.status === "REJECTED") {
      removeStorageWithExpiresIn("token");
    }

    if (!token) {
      router.replace({
        pathname: handleRoute("login"),
        query: { ...router.query },
      });
    }
  }, [routerIsReady]);

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
        <title>{t("sign")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {res.response.status === "PENDING" ? (
        <>
          {" "}
          <div className="flex justify-center relative h-[45rem] items-center ">
            <Loading title={t("loadingTitle")} />
          </div>
          <Footer />
        </>
      ) : (
        <div className=" pt-8 pb-10 sm:w-full h-full relative  mx-auto">
          {" "}
          <FRModal modal={openFRModal} setModal={setopenFRModal} />
          <Configuration
            selectFontModal={selectFontModal}
            setSelectFontModal={setSelectFontModal}
            openScratchesModal={openScratchesModal}
            setOpenScratchesModal={setOpenScratchesModal}
          />
          <ChooseFontModal
            modal={selectFontModal}
            setModal={setSelectFontModal}
            tilakaName={data}
          />
          <ChooseScratchModal
            modal={openScratchesModal}
            setModal={setOpenScratchesModal}
          />
          <OTPModal modal={otpModal} setModal={setOtpModal} />
          <Viewer
            setTotalPages={setTotalPages}
            url={`{data:application/pdf;base64,${res.response.data.document}`}
            tandaTangan={res.response.data.tandaTangan}
          />
          <div className="px-5 fixed w-full flex justify-center items-center bottom-0">
            {res.response.data.document && (
              <Button
                style={{
                  backgroundColor: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.button_color as string,
                  ),
                }}
                size="md"
                onClick={() =>
                  res.response.data.mfa.toLowerCase() == "fr"
                    ? setopenFRModal(true)
                    : setOtpModal(true)
                }
                className=" uppercase"
              >
                {t("sign")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cQuery = context.query;
  const uuid =
    cQuery.transaction_id || cQuery.request_id || cQuery.registration_id;
  const params = { ...cQuery, registration_id: uuid };
  const queryString = new URLSearchParams(params as any).toString();

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

export default Signing;

const Configuration: React.FC<{
  selectFontModal: boolean;
  openScratchesModal: boolean;
  setOpenScratchesModal: Dispatch<SetStateAction<boolean>>;
  setSelectFontModal: Dispatch<SetStateAction<boolean>>;
}> = ({
  selectFontModal,
  setSelectFontModal,
  openScratchesModal,
  setOpenScratchesModal,
}) => {
  const { t }: any = i18n;
  return (
    <div className="flex flex-row items-center shadow-xl z-10 left-0 fixed py-2 w-full top-0 bg-[rgb(223,225,230)] justify-center gap-10">
      <div className="flex flex-col  ">
        <button onClick={() => setOpenScratchesModal(!openScratchesModal)}>
          <Image
            width={25}
            height={25}
            src={`${assetPrefix}/images/goresan.svg`}
            alt="scratch"
            />
          <Heading className="text-[#727272] text-base">
            {t("signatureOption1")}
          </Heading>
        </button>
      </div>
      <div className="flex flex-col">
        <button onClick={() => setSelectFontModal(!selectFontModal)}>
          <Image
            width={25}
            height={25}
            src={`${assetPrefix}/images/font.svg`}
            alt="font"
          />
          <Heading className="text-[#727272] text-base">Font</Heading>
        </button>
      </div>
    </div>
  );
};

export const FRModal: React.FC<Active | any> = ({ modal, setModal }) => {
  const router = useRouter();
  const routerQuery = router.query;
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);
  const { t }: any = i18n;
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (isFRSuccess && modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [isFRSuccess]);

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        {isFRSuccess ? (
          <div className="flex flex-col  items-center">
            <Heading className=" block text-center  whitespace-nowrap  font-semibold ">
              {t("signSuccess")}
            </Heading>
            <div className="my-10">
              <Image
                width={150}
                height={150}
                src={`${assetPrefix}/images/successFR.svg`}
                alt="successFR"
              />
            </div>

            <Button
              onClick={() => {
                setModal(!modal);
                setIsFRSuccess(false);
                if (routerQuery.redirect_url) {
                  window.location.replace(
                    concateRedirectUrlParams(
                      routerQuery.redirect_url as string,
                      ""
                    )
                  );
                }
              }}
              size="full"
              className="uppercase mt-5 h-9"
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.button_color as string
                ),
              }}
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <>
            <Heading className=" block text-center font-semibold ">
              {t("frTitle")}
            </Heading>
            <Paragraph className="mt-2 block text-center text-sm font-normal">
              {t("frSubtitle1")}
            </Paragraph>
            {/* <FRCamera setModal={setModal} setIsFRSuccess={setIsFRSuccess} /> */}
            <Button
              onClick={() => setModal(!modal)}
              size="full"
              className="uppercase mt-5 h-9"
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.button_color as string,
                  "BG"
                ),
              }}
            >
              {t("cancel")}
            </Button>
          </>
        )}
      </div>
    </div>
  ) : null;
};

const ChooseFontModal: React.FC<Active> = ({ modal, setModal, tilakaName }) => {
  const dispatch: AppDispatch = useDispatch();
  const [form, formSetter] = useState<TFontSig | string>("champignonaltswash");
  const [sig, setSig] = useState<any>();
  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter(e.currentTarget.value);
    setSig(e.currentTarget);
  };
  const { t }: any = i18n;

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const convertToDataURL = async () => {
    const canvas = await html2canvas(sig.parentNode.children[1], {
      height: 60,
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
    dispatch(addFont(canvas.toDataURL("image/png")));
  };
  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-2">
        <Heading className="block text-center  whitespace-nowrap">
          {t("chooseFont")}
        </Heading>
        <div className="mt-5 flex flex-col gap-5">
          <div
            className={`grid  ${
              (tilakaName?.length as number) > 15
                ? "grid-cols gap-5"
                : "grid-col-2"
            } gap-3 mt-5`}
          >
            <label className="relative flex justify-center items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="Adine-Kirnberg"
                onChange={handleFormOnChange}
                checked={form === "Adine-Kirnberg"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl Adine-Kirnberg bg-transparent text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
            <label className="relative flex justify-center items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="champignonaltswash"
                onChange={handleFormOnChange}
                checked={form === "champignonaltswash"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl champignonaltswash text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
            <label className="relative flex justify-center items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="FormalScript"
                onChange={handleFormOnChange}
                checked={form === "FormalScript"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-lg FormalScript text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
            <label className="relative flex justify-center items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="HerrVonMuellerhoff-Regular"
                onChange={handleFormOnChange}
                checked={form === "HerrVonMuellerhoff-Regular"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-base HerrVonMuellerhoff-Regular text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
            <label className="relative flex justify-center items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="MrsSaintDelafield-Regular"
                onChange={handleFormOnChange}
                checked={form === "MrsSaintDelafield-Regular"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl MrsSaintDelafield-Regular text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
            <label className="relative flex justify-center">
              <input
                type="radio"
                name="signature_font_type"
                value="SCRIPTIN"
                onChange={handleFormOnChange}
                checked={form === "SCRIPTIN"}
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl SCRIPTIN text-_030326 absolute w-fit text-center">
                {tilakaName}
              </p>
            </label>
          </div>
        </div>
        <Button
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
          }}
          size="full"
          className="uppercase mt-5 block h-9 text-white"
          onClick={() => {
            setModal(!modal);
            convertToDataURL();
          }}
        >
          {t("save")}
        </Button>
        <Button
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.action_font_color as string
            ),
          }}
          className="uppercase"
          onClick={() => setModal(!modal)}
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  ) : null;
};

const ChooseScratchModal: React.FC<Active> = ({ modal, setModal }) => {
  const sigPad = useRef<any>();
  const dispatch: AppDispatch = useDispatch();

  const onClickHandler = (e: React.SyntheticEvent) => {
    const scratch = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
    dispatch(addScratch(scratch));
  };

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { t }: any = i18n;

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-2">
        <Heading className="block text-center  whitespace-nowrap">
          {t("signatureOption1")}
        </Heading>
        <SignaturePad sigPad={sigPad} />
        <Button
          onClick={(e) => {
            setModal(!modal);
            onClickHandler(e);
          }}
          style={{
            backgroundColor: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.button_color as string
            ),
          }}
          size="full"
          className="uppercase mt-5 h-9 text-white"
        >
          {t("save")}
        </Button>
        <Button
          onClick={() => setModal(!modal)}
          style={{
            color: themeConfigurationAvaliabilityChecker(
              themeConfiguration?.data.action_font_color as string
            ),
          }}
          className="uppercase"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  ) : null;
};

export const OTPModal: React.FC<Active> = ({ modal, setModal }) => {
  const [successSigning, setSuccessSigning] = useState<boolean>(false);
  const document = useSelector((state: RootState) => state.document);
  const signature = useSelector((state: RootState) => state.signature);
  const [timeRemaining, setTimeRemaining] = useState<string>("0");
  const [isCountDone, setIsCountDone] = useState<boolean>(false);
  const router = useRouter();
  const { transaction_id, request_id, ...restRouterQuery } = router.query;

  const [values, setValues] = useState(["", "", "", "", "", ""]);

  const { t }: any = i18n;

  const interval = 60000;

  const reset = () => {
    localStorage.endTime = +new Date() + interval;
  };

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const timerHandler = () => {
    setInterval(function () {
      const date: any = new Date();
      const remaining = localStorage.endTime - date;
      const timeRemaining = Math.floor(remaining / 1000).toString();
      if (remaining >= 1) {
        setTimeRemaining(timeRemaining);
      } else {
        setIsCountDone(false);
      }
    }, 100);
  };

  const handleTriggerSendOTP = () => {
    restGetOtp({})
      .then((res) => {
        if (res.success) {
          toast(`Kode OTP telah dikirim ke Email anda`, {
            type: "info",
            toastId: "info",
            isLoading: false,
            position: "top-center",
            style: {
              backgroundColor: themeConfiguration?.data.toast_color as string,
            },
          });
          timerHandler();
          reset();
          setIsCountDone(true);
        } else {
          toast.error(res.message, { icon: <XIcon /> });
        }
      })
      .catch(() => {
        toast.error("Kode OTP gagal dikirim", { icon: <XIcon /> });
      });
  };

  useEffect(() => {
    if (modal && !successSigning && !isCountDone && timeRemaining === "0") {
      handleTriggerSendOTP();
    } else {
      setIsCountDone(true);
      timerHandler();
    }
  }, [modal]);

  const setEndTimeToZero = () => {
    localStorage.endTime = "0";
  };

  const onClickHandler = () => {
    toast(`Loading...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
      style: {
        backgroundColor: themeConfiguration?.data.toast_color as string,
      },
    });
    restSigning({
      payload: {
        file_name: new Date().getTime().toString(),
        otp_pin: values.join(""),
        content_pdf: document.response.data.document,
        width: document.response.data.width,
        height: document.response.data.height,
        face_image: "",
        coordinate_x: document.response.data.posX,
        coordinate_y: document.response.data.posY,
        signature_image:
          signature.data.font ||
          signature.data.scratch ||
          document.response.data.tandaTangan,
        page_number: document.response.data.page_number,
        qr_content: "",
        tilakey: "",
        company_id: "",
        api_id: "",
        trx_id: (transaction_id as string) || (request_id as string),
      },
    })
      .then((res) => {
        setEndTimeToZero();
        setSuccessSigning(true);
        toast.dismiss("loading");
        localStorage.setItem("count", "0");
      })
      .catch((err) => {
        toast.dismiss("loading");
        if (err.response?.status === 401) {
          router.replace({
            pathname: handleRoute("login"),
            query: { ...router.query },
          });
        } else {
          toast.error(t("otpInvalid"), { icon: <XIcon /> });
          setValues(["", "", "", "", "", ""]);
          const newCount =
            parseInt(localStorage.getItem("count") as string) + 1;
          localStorage.setItem("count", newCount.toString());
          const count = parseInt(localStorage.getItem("count") as string);
          if (count >= 5) {
            setEndTimeToZero();
            removeStorageWithExpiresIn("token");
            localStorage.setItem("count", "0");
            restLogout({});
            router.replace({
              pathname: handleRoute("login"),
              query: { ...router.query },
            });
          }
        }
      });
  };

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5">
        {successSigning ? (
          <div className="flex flex-col  items-center">
            <Heading className="block text-center  whitespace-nowrap">
              {t("signSuccess")}
            </Heading>
            <div className="my-10">
              <Image
                width={150}
                height={150}
                src={`${assetPrefix}/images/successFR.svg`}
                alt="fr"
              />
            </div>

            <button
              onClick={() => {
                setModal(false);
                if (restRouterQuery.redirect_url) {
                  window.location.replace(
                    concateRedirectUrlParams(
                      restRouterQuery.redirect_url as string,
                      ""
                    )
                  );
                }
              }}
              className="bg-primary btn uppercase text-white w-full mt-5 mx-auto rounded-sm h-9"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <Heading className=" block text-center pb-5  whitespace-nowrap  font-semibold ">
              {t("frTitle")}
            </Heading>
            <Paragraph className=" block text-center pb-5  ">
              {t("frSubtitle2")}
            </Paragraph>
            <PinInput
              containerStyle={{
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: "10px",
              }}
              inputStyle={{ alignItems: "center", gap: 5, marginTop: "10px" }}
              placeholder=""
              size="lg"
              values={values}
              onChange={(value, index, values) => setValues(values)}
            />
            <div className="flex justify-center text-sm gap-1 mt-5">
              <p className="text-neutral200">{t("dindtReceiveOtp")}</p>
              <div
                style={{
                  color: themeConfigurationAvaliabilityChecker(
                    themeConfiguration?.data.action_font_color as string,
                    "BG"
                  ),
                }}
                className="font-semibold"
              >
                {!isCountDone ? (
                  <Button
                    variant="ghost"
                    style={{
                      color: themeConfigurationAvaliabilityChecker(
                        themeConfiguration?.data.action_font_color as string,
                        "BG"
                      ),
                    }}
                    className="mx-0"
                    size="none"
                    onClick={handleTriggerSendOTP}
                  >
                    {t("resend")}
                  </Button>
                ) : (
                  `0:${timeRemaining}`
                )}
              </div>
            </div>
            <Button
              disabled={values.join("").length < 6}
              onClick={onClickHandler}
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.button_color as string,
                  "BG"
                ),
              }}
              className="mt-16 block mx-auto py-3"
              size="lg"
            >
              {t("confirm")}
            </Button>
            <Button
              onClick={() => {
                setValues(["", "", "", "", "", ""]);
                setModal(!modal);
              }}
              className="font-semibold mt-2"
              variant="ghost"
              style={{
                color: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.action_font_color as string,
                  "BG"
                ),
              }}
            >
              {t("cancel")}
            </Button>
          </>
        )}
      </div>
    </div>
  ) : null;
};
