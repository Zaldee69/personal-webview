import Camera from "@/components/Camera";
import Footer from "@/components/Footer";
import ProgressStepBar from "@/components/ProgressStepBar";
import Head from "next/head";
import Image from "next/image";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { assetPrefix } from "next.config";
import { actionText } from "@/utils/actionText"
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { RestKycGenerateRevokeAction, RestKycVerificationRevoke } from "../../../infrastructure";
import { resetImages, setActionList } from "@/redux/slices/livenessSlice";
import { TKycVerificationRevokeRequestData } from "infrastructure/rest/kyc/types";
import { handleRoute } from "@/utils/handleRoute";

const RevokeMekari = () => {
  let [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [failedMessage, setFailedMessage] = useState<string>("");

  const actionList = useSelector(
    (state: RootState) => state.liveness.actionList
  );
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);

  const router = useRouter();
  const routerQuery = router.query;
  const subTtile: string =
    routerQuery.status === "done"
      ? "Terima kasih telah mengikuti proses Liveness. Hasil dinilai berdasarkan keaslian serta kesesuaian foto dengan aksi yang diminta."
      : "Pastikan wajah di dalam garis panduan dan ikuti petunjuk dengan benar";

  const dispatch: AppDispatch = useDispatch();

  const generateAction = () => {
    const body = {
      revokeId: routerQuery.revoke_id as string,
    }
    RestKycGenerateRevokeAction(body)
    .then((result) => {
      if (result?.data) {
        const payload = ["look_straight"].concat(
          result.data.actionList
        );
        dispatch(setActionList(payload));
      } else {
        throw new Error(result.message);
      }
    })
    .catch((error) => {
      toast.dismiss("generateAction");
      const msg = error.response?.data?.data?.errors?.[0];
      const status = error.response?.data?.data?.status;
      if (msg) {
          toast.error(msg, {
            icon: <XIcon />,
          });
          if(status === "F"){
            if(routerQuery.redirect_url){
              setTimeout(() => {
                const searchParams = new URLSearchParams(
                  `${routerQuery.redirect_url}?status=Gagal&revoke_id=${routerQuery.revoke_id}&user_identifier=${routerQuery.user}`
                )
                window.top!.location.href = decodeURIComponent(
                  searchParams.toString()
                );
              }, 3000)
            }
          } else if (status === "S"){
            if(routerQuery.redirect_url){
              setTimeout(() => {
                const searchParams = new URLSearchParams(
                  `${routerQuery.redirect_url}?status=Sukses&revoke_id=${routerQuery.revoke_id}&user_identifier=${routerQuery.user}`
                )
                window.top!.location.href = decodeURIComponent(
                  searchParams.toString()
                );
              }, 3000)
            }
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

  const verifyLiveness = async () => {
    toast(`Mengecek status...`, {
      type: "info",
      toastId: "verification",
      isLoading: true,
      position: "top-center",
    });

    setFailedMessage("");

    try {
      const body: TKycVerificationRevokeRequestData = {
        revokeId: router.query.revoke_id as string,
        image_selfie: "",
      };

      const imageActions = images.filter(
        (image) =>
          image.action !== "look_straight"
      );
      imageActions.forEach((image, index) => {
        body[`image_action${++index}` as keyof TKycVerificationRevokeRequestData] =
          image.value;
      });
      const imageSelfie = images.filter(
        (image) => image.action === "look_straight"
      )[0];

      body.image_selfie = imageSelfie.value;

      const result = await RestKycVerificationRevoke(body)
      if(result.success) {
        toast.dismiss("verification")
        removeStorage()
        if(routerQuery.redirect_url){
          setTimeout(() => {
            const searchParams = new URLSearchParams(
              `${routerQuery.redirect_url}?status=Sukses&revoke_id=${routerQuery.revoke_id}&user_identifier=${result.data.user}`
            )
            window.top!.location.href = decodeURIComponent(
              searchParams.toString()
            );
          }, 3000)
        }
      } else {
        toast.dismiss('verification')
        if(result.data.status === "F") {
          if(routerQuery.redirect_url){
            setTimeout(() => {
              const searchParams = new URLSearchParams(
                `${routerQuery.redirect_url}?status=Gagal&revoke_id=${routerQuery.revoke_id}&user_identifier=${result.data.user}`
              )
              window.top!.location.href = decodeURIComponent(
                searchParams.toString()
              );
            }, 3000)
          }
        } else {
          router.push({
            pathname: handleRoute(assetPrefix ? "liveness-fail" : "/liveness-fail"),
            query: {
              ...routerQuery,
            },
          });
        }

      }
    } catch (e: any) {
        toast.dismiss("verification")
        const msg = e.response?.data?.data?.errors?.[0];
        if (msg) {
            toast.error(msg, {
              icon: <XIcon />,
            });
        } else {
          toast.error(
            e.response?.data?.message || "Verifikasi gagal",
            {
              icon: <XIcon />,
            }
          );
        }
      
    }
  }

  const removeStorage = () => {
    localStorage.removeItem("cert-revoke-token");
  };

  useEffect(() => {
    if (!isDone) return;
    verifyLiveness();
  }, [isDone]);

  useEffect(() => {
    if (!router.isReady) return;
    generateAction();
    dispatch(resetImages());
  }, [router.isReady]);
  

  return (
    <Fragment>
      <Head>
        <title>Liveness</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="py-10 max-w-sm mx-auto px-2">
        <h1 className="font-poppins font-semibold mb-3 ">Liveness</h1>
        <span className="font-poppins text-sm ">{subTtile}</span>
        {routerQuery.status === "done" ? (
          <div className="mt-10 rounded-md h-[250px] flex justify-center items-center sm:w-full md:w-full">
            <Loading title="Please Wait" />
          </div>
        ) : (
          <Camera
            currentActionIndex={currentActionIndex}
            setCurrentActionIndex={setCurrentActionIndex}
            currentStep="Liveness Detection"
            setFailedMessage={setFailedMessage}
          />
        )}
        <div className="mt-5 flex justify-center">
          {routerQuery.status !== "done" && (
            <Image
              src={`${assetPrefix}/images/hadap-depan.svg`}
              width={50}
              height={50}
              alt="action"
            />
          )}
          {/* {
            actionList.length === 2 && (
              <Image src={`${assetPrefix}/images/${currentIndex}.svg`} width={50} height={50} />
            )
          } */}
        </div>
        <div className="flex items-center justify-center mt-5 flex-col">
          <span
            className={`font-poppins font-medium ${
              routerQuery.status === "done" ? "hidden" : null
            }`}
          >
            {actionText(actionList[currentActionIndex])}
          </span>
          {failedMessage ? (
            <span className="text-center font-poppins text-sm mt-7 text-red300">
              {failedMessage}
            </span>
          ) : (
            <span
              className={`text-center font-poppins text-sm mt-7 text-neutral ${
                routerQuery.status === "done" ? "hidden" : null
              }`}
            >
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
    </Fragment>
  );
};

export default RevokeMekari;
