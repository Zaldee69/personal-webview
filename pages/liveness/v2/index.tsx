import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { AppDispatch, RootState } from "@/redux/app/store";
import Camera from "../../../components/Camera";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  RestKycFinalForm,
  RestLivenessV2GenerateAction,
  RestLivenessv2Verification,
} from "../../../infrastructure";
import {
  TKycVerificationRequestData,
  TLivenessV2VerificationRequestData,
} from "../../../infrastructure/rest/kyc/types";
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";
import Footer from "../../../components/Footer";
import ProgressStepBar from "../../../components/ProgressStepBar";
import { resetImages, setActionList } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";
import Loading from "@/components/Loading";
import SkeletonLoading from "@/components/SkeletonLoading";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import i18n from "i18";
import UnsupportedDeviceModal from "@/components/UnsupportedDeviceModal";
import Guide from "@/components/Guide";
import InitializingFailed from "@/components/atoms/InitializingFailed";
import Initializing from "@/components/atoms/Initializing";
import { ActionGuide1, ActionGuide2 } from "@/components/atoms/ActionGuide";
import { actionText } from "@/utils/actionText";
import { assetPrefix } from "next.config";
import ImageDebugger from "@/components/ImageDebugger";
import { log } from "@/utils/logging";

type TQueryParams = {
  request_id?: string;
  redirect_url?: string;
  reason_code?: string;
  register_id?: string;
  status?: string;
};

let human: any = undefined;

const Liveness = () => {
  const router = useRouter();
  const routerQuery = router.query;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isStepDone, setStepDone] = useState<boolean>(false);
  const [isGenerateAction, setIsGenerateAction] = useState<boolean>(true);
  const [isMustReload, setIsMustReload] = useState<boolean>(false);
  const [isLivenessStarted, setIsLivenessStarted] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [humanDone, setHumanDone] = useState(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const actionList = useSelector(
    (state: RootState) => state.liveness.actionList
  );
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);
  const { t }: any = i18n;

  const currentIndex =
    actionList[currentActionIndex] === "look_straight"
      ? "hadap-depan"
      : actionList[currentActionIndex] === "mouth_open"
      ? "buka-mulut"
      : actionList[currentActionIndex] === "blink"
      ? "pejam"
      : "hadap-depan";

  useEffect(() => {
    const track: any = document.querySelector(".track");
    if (progress === 100) {
      track?.classList?.add("white-stroke");
      setTimeout(() => {
        setStepDone(true);
        track?.classList?.remove("white-stroke");
      }, 2000);
    }
  }, [progress]);

  const dispatch: AppDispatch = useDispatch();

  const setHumanReady = () => {
    const loading: any = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
    }
  };

  const generateAction = () => {
    const body = {
      uuid: routerQuery.request_id as string,
    };

    toast(`Membuat aksi...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
    });

    RestLivenessV2GenerateAction(body)
      .then((res) => {
        if (res.success) {
          setIsDisabled(false);
          setIsGenerateAction(false);
          toast.dismiss("loading");
          toast.success("Pembuatan daftar aksi sukses", {
            icon: <CheckOvalIcon />,
            autoClose: 3000,
          });
          const payload = ["look_straight"].concat(res.data.actionList);
          dispatch(setActionList(payload));
        } else {
          const message = res.response.data.data.errors[0] === "Request tidak ditemukan" ? res.response.data.data.errors[0] : "Request telah liveness"
          toast.dismiss("loading");
          setIsDisabled(true);
          setIsGenerateAction(true);
          toast(message, {
            type: "error",
            autoClose: 5000,
            position: "top-center",
          });
        }
      })
      .catch((err) => {
        toast.dismiss("loading");
        throw err;
      });
  };

  const changePage = async () => {
    setIsLoading(true);
    setFailedMessage("");

    try {
      const body: TLivenessV2VerificationRequestData = {
        uuid: router.query.request_id as string,
        selfie_image: "",
      };

      const imageActions = images.filter(
        (image) =>
          image.step === "Liveness Detection" &&
          image.action !== "look_straight"
      );
      imageActions.forEach((image, index) => {
        body[
          `image_action${++index}` as keyof TLivenessV2VerificationRequestData
        ] = image.value;
      });
      const imageSelfie = images.filter(
        (image) => image.action === "look_straight"
      )[0];

      body.selfie_image = imageSelfie.value;

      const result = await RestLivenessv2Verification(body);
      if (result.success) {
        removeStorage();
        router.push({
          pathname: handleRoute("liveness/v2/success"),
          query: { ...router.query },
        });
      } else {
        const attempt =
          result.data?.liveness_error_counter ||
          parseInt(localStorage.getItem("tlk-counter1") as string) + 1;
        localStorage.setItem("tlk-counter1", attempt.toString());

        toast(
          result.data?.liveness_error_counter &&
            result.data?.liveness_error_counter > 2
            ? "Registrasi Gagal"
            : "Liveness gagal, mohon ulangi",
          {
            type: "error",
            autoClose: 5000,
            position: "top-center",
          }
        );

        if (result.data?.liveness_error_counter > 2) {
          router.push({
            pathname: handleRoute("liveness-failure/v2"),
            query: {
              ...router.query,
            },
          });
        } else {
          router.replace({
            pathname: handleRoute("liveness-fail/v2"),
            query: {
              ...router.query,
            },
          });
        }
      }
    } catch (e) {
      toast.dismiss("verification");
      toast(`${e || "Tidak merespon!"}`, {
        type: "error",
        autoClose: e ? 5000 : false,
        position: "top-center",
      });
      setIsLoading(false);
      setTimeout(() => {
        router.push({
          pathname: handleRoute("liveness-fail/v2"),
          query: { ...router.query },
        });
      }, 5000);
    }
  };

  const removeStorage = () => {
    localStorage.removeItem("tlk-reg-id");
    localStorage.removeItem("tlk-counter1");
  };

  useEffect(() => {
    const initHuman = async () => {
      const humanConfig: any = {
        // user configuration for human, used to fine-tune behavior
        backend: "webgl",
        modelBasePath: assetPrefix ? `${assetPrefix}/models` : "/models",
        filter: { enabled: false, equalization: false },
        face: {
          enabled: true,
          detector: { rotation: true },
          mesh: { enabled: true },
          iris: { enabled: true },
          description: { enabled: true },
          emotion: { enabled: false },
        },
        body: { enabled: false },
        hand: { enabled: false },
        object: { enabled: false },
        gesture: { enabled: true },
        debug: true,
      };
      import("@vladmandic/human").then((H) => {
        human = new H.default(humanConfig);
        human.warmup().then(() => {
          setHumanDone(true);
        });
      });
    };
    initHuman();
  }, []);

  useEffect(() => {
    if (!isDone) return;
    changePage();
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!humanDone && isClicked) {
      toast.dismiss();
      toast(`Loading...`, {
        type: "info",
        toastId: "load",
        isLoading: true,
        position: "top-center",
      });
      setIsDisabled(true);
    } else if (humanDone && isClicked) {
      toast.dismiss("load");
      setIsLivenessStarted(true);
    }
  }, [isClicked, humanDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!router.isReady) return;
    generateAction();
    dispatch(resetImages());
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLivenessStarted)
    return <Guide setIsClicked={setIsClicked} isDisabled={isDisabled} />;

  return (
    <>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-10 max-w-sm mx-auto px-2">
        <h2 className="font-poppins text-xl font-semibold">
          {isGenerateAction ? <SkeletonLoading width="w-2/5" /> : "Liveness"}
        </h2>
        {(!isStepDone && actionList.length > 1) || isMustReload ? (
          <ActionGuide2
            currentIndex={currentIndex}
            isGenerateAction={isGenerateAction}
            isStepDone={isStepDone}
            isMustReload={isMustReload}
          />
        ) : (
          <div>
            {isGenerateAction && (
              <div className="flex gap-5 mx-2 mt-5">
                <SkeletonLoading width="w-[60px]" height="h-[50px]" />
                <div className="flex items-center w-full flex-col">
                  <SkeletonLoading width="w-full" height="h-[20px]" isDouble />
                </div>
              </div>
            )}
            {!isLoading && (
              <ActionGuide1
                actionList={actionList}
                currentIndex={currentIndex}
                currentActionIndex={currentActionIndex}
                failedMessage={failedMessage}
                actionText={actionText}
              />
            )}
          </div>
        )}
        <div
          className={[
            "mt-5 rounded-md h-[270px] flex justify-center items-center sm:w-full md:w-full",
            isLoading ? "block" : "hidden",
          ].join(" ")}
        >
          <Loading title={t("loadingTitle")} />
        </div>
        <div className={["relative", isLoading ? "hidden" : "block"].join(" ")}>
          {!isMustReload ? <Initializing /> : <InitializingFailed />}
          <Camera
            currentActionIndex={currentActionIndex}
            setCurrentActionIndex={setCurrentActionIndex}
            currentStep="Liveness Detection"
            setFailedMessage={setFailedMessage}
            setProgress={setProgress}
            setHumanReady={setHumanReady}
            humanDone={humanDone}
            human={human}
          />
        </div>
        {isGenerateAction ? (
          <div className="w-2/5 h-[5px] mx-auto mt-5 border-b-2 border-[#E6E6E6] "></div>
        ) : (
          <div>
            {isMustReload ? (
              <ProgressStepBar actionList={actionList} currentActionIndex={0} />
            ) : (
              <ProgressStepBar
                actionList={actionList}
                currentActionIndex={isStepDone ? currentActionIndex : 0}
              />
            )}
          </div>
        )}
        <Footer />
        <UnsupportedDeviceModal />
      </div>
    </>
  );
};

export default Liveness;
