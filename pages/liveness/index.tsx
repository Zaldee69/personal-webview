import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { AppDispatch, RootState } from "@/redux/app/store";
import Camera from "../../components/Camera";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  RestKycCheckStep,
  RestKycGenerateAction,
  RestKycVerification,
} from "../../infrastructure";
import { TKycVerificationRequestData } from "../../infrastructure/rest/kyc/types";
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";

import Footer from "../../components/Footer";
import ProgressStepBar from "../../components/ProgressStepBar";
import { resetImages, setActionList } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";
import { assetPrefix } from "../../next.config";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";

const Liveness = () => {
  const router = useRouter();
  const routerQuery = router.query;

  const [isSuccessState, setIsSuccessState] = useState<boolean>(false);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string>("");

  const actionList = useSelector(
    (state: RootState) => state.liveness.actionList
  );
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);

  const currentIndex =
    actionList[currentActionIndex] === "look_straight"
      ? "hadap-depan"
      : actionList[currentActionIndex] === "mouth_open"
      ? "buka-mulut"
      : actionList[currentActionIndex] === "blink"
      ? "pejam"
      : "hadap-depan";

  const actionText = () => {
    switch (actionList[currentActionIndex]) {
      case "look_straight":
        return "Wajah menghadap ke depan";
      case "look_up":
        return "Wajah menghadap ke  atas";
      case "look_down":
        return "Wajah menghadap ke bawah";
      case "look_left":
        return "Wajah menghadap ke kiri";
      case "look_right":
        return "Wajah menghadap ke kanan";
      case "mouth_open":
        return "Buka mulut dengan lebar";
      case "blink":
        return "Pejamkan kedua mata selama 3 detik";
      default:
        return "";
    }
  };

  const dispatch: AppDispatch = useDispatch();

  const generateAction = () => {
    const body = {
      registerId: routerQuery.request_id as string,
    };
    toast(`Mengecek status...`, {
      type: "info",
      toastId: "generateAction",
      isLoading: true,
      position: "top-center",
    });
    RestKycCheckStep({
      payload: { registerId: routerQuery.request_id as string },
    })
      .then((res) => {
        if (
          res.success &&
          res.data.status !== "D" &&
          res.data.status !== "F" &&
          res.data.status !== "E"
        ) {
          // this scope for status A B C S
          if (res.data.status === "S") {
            toast.dismiss("generateAction");
            const params = {
              register_id: routerQuery.request_id,
              status: res.data.status,
            };
            const queryString = new URLSearchParams(params as any).toString();
            if (routerQuery.redirect_url) {
              window.top!.location.href = concateRedirectUrlParams(
                routerQuery.redirect_url as string,
                queryString
              );
            } else {
              toast.success(res?.message || "pengecekan step berhasil", {
                icon: <CheckOvalIcon />,
              });
            }
          } else {
            RestKycGenerateAction(body)
              .then((result) => {
                if (result?.data) {
                  const payload = ["look_straight"].concat(
                    result.data.actionList
                  );
                  dispatch(setActionList(payload));
                  toast(`${result.message}`, {
                    type: "success",
                    position: "top-center",
                    autoClose: 3000,
                  });
                  toast.dismiss("generateAction");
                } else {
                  throw new Error(result.message);
                }
              })
              .catch((error) => {
                toast.dismiss("generateAction");
                const msg = error.response?.data?.data?.errors?.[0];
                if (msg) {
                  if (
                    msg === "Proses ekyc untuk registrationId ini telah sukses"
                  ) {
                    toast(`${msg}`, {
                      type: "success",
                      position: "top-center",
                      autoClose: 3000,
                    });
                  } else {
                    toast.error(msg, {
                      icon: <XIcon />,
                    });
                  }
                } else {
                  toast.error(
                    error.response?.data?.message || "Generate Action gagal",
                    {
                      icon: <XIcon />,
                    }
                  );
                }
              });
          }
        } else {
          // this scope for status D F E
          toast.dismiss("generateAction");
          toast(`${res.message || "Tidak merespon!"}`, {
            type: "error",
            autoClose: 5000,
            position: "top-center",
            toastId: "errToast1",
          });
          if (
            res.message === "Anda berada di tahap pengisian formulir" ||
            res.data.status === "D"
          ) {
            toast.dismiss("errToast1");
            if (res.data.pin_form) {
              router.replace({
                pathname: handleRoute("kyc/pinform"),
                query: {
                  ...routerQuery,
                  registration_id: router.query.request_id,
                },
              });
            } else {
              router.push({
                pathname: handleRoute("form"),
                query: { ...routerQuery, request_id: router.query.request_id },
              });
            }
          } else {
            if (
              res.data.status === "F" &&
              res.data.pin_form &&
              routerQuery.redirect_url
            ) {
              const params = {
                status: res.data.status,
                register_id: routerQuery.request_id,
              };
              const queryString = new URLSearchParams(params as any).toString();
              window.top!.location.href = concateRedirectUrlParams(
                routerQuery.redirect_url as string,
                queryString
              );
            } else {
              router.push({
                pathname: handleRoute("liveness-failure"),
                query: { ...routerQuery, request_id: router.query.request_id },
              });
            }
          }
        }
      })
      .catch((err) => {
        toast.dismiss("generateAction");
        if (err.response?.data?.data?.errors?.[0]) {
          toast.error(err.response?.data?.data?.errors?.[0], {
            icon: <XIcon />,
          });
        } else {
          toast.error(err.response?.data?.message || "pengecekan step gagal", {
            icon: <XIcon />,
          });
        }
      });
  };

  const changePage = async () => {
    toast(`Mengecek status...`, {
      type: "info",
      toastId: "verification",
      isLoading: true,
      position: "top-center",
    });

    setFailedMessage("");

    try {
      const body: TKycVerificationRequestData = {
        registerId: router.query.request_id as string,
        mode: "web",
        image_action1: "",
        image_action2: "",
        image_action3: "",
        image_selfie: "",
      };

      const imageActions = images.filter(
        (image) =>
          image.step === "Liveness Detection" &&
          image.action !== "look_straight"
      );
      imageActions.forEach((image, index) => {
        body[`image_action${++index}` as keyof TKycVerificationRequestData] =
          image.value;
      });
      const imageSelfie = images.filter(
        (image) => image.action === "look_straight"
      )[0];

      body.image_selfie = imageSelfie.value;

      const result = await RestKycVerification(body);
      const status = result.data.status;
      if (result.success) {
        toast.dismiss("verification");
        removeStorage();
        if (result.data.pin_form) {
          router.replace({
            pathname: handleRoute("kyc/pinform"),
            query: { ...routerQuery, registration_id: router.query.request_id },
          });
        } else {
          router.push({
            pathname: handleRoute("form"),
            query: { ...routerQuery, request_id: router.query.request_id },
          });
        }
      } else {
        toast.dismiss("verification");
        const attempt =
          result.data?.numFailedLivenessCheck ||
          parseInt(localStorage.getItem("tlk-counter") as string) + 1;
        localStorage.setItem("tlk-counter", attempt.toString());
        if (status !== "E" && status !== "F") {
          setIsSuccessState(false);
          toast("Live Detection failed. Please try again", {
            type: "error",
            autoClose: 5000,
            position: "top-center",
          });
          setTimeout(() => {
            router.push({
              pathname: handleRoute("liveness-fail"),
              query: { ...routerQuery, request_id: router.query.request_id },
            });
          }, 5000);
        } else {
          if (status) {
            if (status === "E") {
              removeStorage();
              toast(
                "We are unable to find your data in Dukpacil. For further assistance, please contact admin@tilaka.id",
                {
                  type: "error",
                  autoClose: 5000,
                  position: "top-center",
                }
              );
              setIsSuccessState(false);
            } else if (status === "F") {
              toast(
                result?.data?.numFailedLivenessCheck &&
                  result?.data?.numFailedLivenessCheck > 2
                  ? "You have failed 3 times \nYou will be redirected to the next page, please wait..."
                  : "Registration Gagal",
                {
                  type: "error",
                  autoClose: 5000,
                  position: "top-center",
                }
              );
              setTimeout(() => {
                if (result.data.pin_form && routerQuery.redirect_url) {
                  const params = {
                    status: status,
                    register_id: routerQuery.request_id,
                  };
                  const queryString = new URLSearchParams(
                    params as any
                  ).toString();
                  window.top!.location.href = concateRedirectUrlParams(
                    routerQuery.redirect_url as string,
                    queryString
                  );
                } else {
                  router.push({
                    pathname: handleRoute("liveness-fail"),
                    query: {
                      ...routerQuery,
                      request_id: router.query.request_id,
                    },
                  });
                }
              }, 5000);
              setIsSuccessState(false);
            }
          } else {
            setIsSuccessState(false);
          }
        }
      }
    } catch (e) {
      toast.dismiss("verification");
      toast(`${e || "Tidak merespon!"}`, {
        type: "error",
        autoClose: e ? 5000 : false,
        position: "top-center",
      });
      setIsSuccessState(false);
      setTimeout(() => {
        router.push({
          pathname: handleRoute("liveness-fail"),
          query: { ...routerQuery, request_id: router.query.request_id },
        });
      }, 5000);
    }
  };

  const removeStorage = () => {
    localStorage.removeItem("tlk-reg-id");
    localStorage.removeItem("tlk-counter");
  };

  useEffect(() => {
    if (!isDone) return;
    changePage();
  }, [isDone]);

  useEffect(() => {
    if (!router.isReady) return;
    generateAction();
    dispatch(resetImages());
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-10 max-w-sm mx-auto px-2">
        <span className="font-poppins text-sm ">
          Pastikan wajah di dalam garis panduan dan ikuti petunjuk dengan benar
        </span>
        <Camera
          currentActionIndex={currentActionIndex}
          setCurrentActionIndex={setCurrentActionIndex}
          currentStep="Liveness Detection"
          setFailedMessage={setFailedMessage}
        />
        <div className="mt-5 flex justify-center">
          {actionList.length === 2 && (
            <Image
              src={`${assetPrefix}/images/${currentIndex}.svg`}
              width={50}
              height={50}
            />
          )}
        </div>
        <div className="flex items-center justify-center mt-5 flex-col">
          <span className="font-poppins font-medium">{actionText()}</span>
          {failedMessage ? (
            <span className="text-center font-poppins text-sm mt-7 text-red300">
              {failedMessage}
            </span>
          ) : (
            <span className="text-center font-poppins text-sm mt-7 text-neutral">
              Mohon jangan bergerak selama proses pengambilan wajah
            </span>
          )}
        </div>
        <ProgressStepBar
          actionList={actionList}
          currentActionIndex={currentActionIndex}
        />
        <Footer />
      </div>
    </>
  );
};

export default Liveness;
