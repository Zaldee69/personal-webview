import Image from "next/image";
import { useEffect, useState, } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { AppDispatch, RootState } from "@/redux/app/store";
import Camera from "../../components/Camera";
import { useRouter } from "next/router";
import { toast } from 'react-toastify'
import { RestKycCheckStep, RestKycGenerateAction, RestKycVerification } from '../../infrastructure'
import { TKycVerificationRequestData } from '../../infrastructure/rest/kyc/types'
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";


import Footer from "../../components/Footer";
import ProgressStepBar from "../../components/ProgressStepBar";
import { resetImages, setActionList } from "@/redux/slices/livenessSlice";
import { handleRoute } from "@/utils/handleRoute";

const Liveness = () => {
  const router = useRouter()
  const routerQuery = router.query

  const [isSuccessState, setIsSuccessState] = useState<boolean>(false);
  let [currentActionIndex, setCurrentActionIndex] = useState(0);

  const actionList = useSelector((state: RootState) => state.liveness.actionList);
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);


  const actionText = () => {
    switch (actionList[currentActionIndex]) {
      case 'look_straight':
        return 'depan'
      case 'look_up':
        return 'atas'
      case 'look_down':
        return 'bawah'
      case 'look_left':
        return 'kiri'
      case 'look_right':
        return 'kanan'
      default:
        return ''
    }
  }


  const dispatch: AppDispatch = useDispatch();

  const generateAction = () => {
    const body = {
      registerId: routerQuery.request_id as string
    }
    toast(`Mengecek status...`, {
      type: 'info',
      toastId: 'generateAction',
      isLoading: true,
      position: 'top-center',
    })
    RestKycCheckStep({ payload: { registerId: routerQuery.request_id as string } })
      .then((res) => {
        if (res.success && (res.data.status !== 'D' && res.data.status !== 'F' && res.data.status !== 'E')) {
          RestKycGenerateAction(body).then((result) => {
            if (result?.data) {
              const payload = ['look_straight'].concat(result.data.actionList)
              dispatch(setActionList(payload))
              toast(`${result.message}`, {
                type: 'success',
                position: 'top-center',
                autoClose: 3000,
              })
              toast.dismiss('generateAction')
            } else {
              throw new Error(result.message)
            }
          }).catch((error) => {
            toast.dismiss('generateAction')
            const msg = error.response?.data?.data?.errors?.[0] 
            if (msg) {
              if(msg === "Proses ekyc untuk registrationId ini telah sukses"){
                toast(`${msg}`, {
                  type: 'success',
                  position: 'top-center',
                  autoClose: 3000,
                })
              }else {
                toast.error(msg, {
                  icon: <XIcon />,
                });
              }
            } else {
              toast.error(error.response?.data?.message || "Generate Action gagal", {
                icon: <XIcon />,
              });
            }
          })
        } else {
          toast.dismiss('generateAction')
          toast(
            `${res.message || 'Tidak merespon!'
            }`,
            {
              type: 'error',
              autoClose: 5000,
              position: 'top-center',
            }
          )
          if (res.message === 'Anda berada di tahap pengisian formulir') router.push(handleRoute('form'), { query: { registerId: router.query.request_id } })
          else router.push({ pathname: handleRoute("liveness-failure"), query: { registerId: router.query.request_id } });
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
  }

  const changePage = async () => {
    toast(`Mengecek status...`, {
      type: 'info',
      toastId: 'verification',
      isLoading: true,
      position: 'top-center',
    })

    try {
      const body: TKycVerificationRequestData = {
        registerId: router.query.registerId as string,
        mode: "web",
        image_action1: "",
        image_action2: "",
        image_action3: "",
        image_selfie: ""
      };

      const imageActions = images.filter(
        (image) =>
          image.step === "Liveness Detection" &&
          image.action !== "look_straight"
      );
      imageActions.forEach((image, index) => {
        body[`image_action${++index}` as keyof TKycVerificationRequestData] = image.value;
      });
      const imageSelfie = images.filter(
        (image) => image.action === "look_straight"
      )[0];

      body.image_selfie = imageSelfie.value;


      const result = await RestKycVerification(body);
      const status = result.data.status;
      if (result.success) {
        toast.dismiss('verification')
        removeStorage();
        router.push({ pathname: handleRoute("form"), query: { registerId: router.query.request_id } });
      } else {
        toast.dismiss('verification')
        const attempt = result.data?.numFailedLivenessCheck || parseInt(localStorage.getItem('tlk-counter') as string) + 1
        localStorage.setItem('tlk-counter', attempt.toString())
        if (status !== "E" && status !== "F") {
          setIsSuccessState(false);
          toast(
            "Live Detection failed. Please try again",
            {
              type: 'error',
              autoClose: 5000,
              position: 'top-center',
            }
          )
          setTimeout(() => {
            router.push({ pathname: handleRoute("liveness-fail"), query: { registerId: router.query.request_id } });
          }, 5000);
        } else {
          if (status) {
            if (status === "E") {
              removeStorage();
              toast(
                'We are unable to find your data in Dukpacil. For further assistance, please contact admin@tilaka.id',
                {
                  type: 'error',
                  autoClose: 5000,
                  position: 'top-center',
                }
              )
              setIsSuccessState(false);
            } else if (status === "F") {
              toast(
                result?.data?.numFailedLivenessCheck && result?.data?.numFailedLivenessCheck > 2 ? "You have failed 3 times \nYou will be redirected to the next page, please wait..." : 'Registration Gagal',
                {
                  type: 'error',
                  autoClose: 5000,
                  position: 'top-center',
                }
              )
              setTimeout(() => {
                router.push({ pathname: handleRoute("liveness-fail"), query: { registerId: router.query.request_id } });
              }, 5000);
              setIsSuccessState(false);
            }
          } else {
            setIsSuccessState(false)
          }
        }
      }
    } catch (e) {
      toast.dismiss('verification')
      toast(
        `${e || 'Tidak merespon!'
        }`,
        {
          type: 'error',
          autoClose: e
            ? 5000
            : false,
          position: 'top-center',
        }
      )
      setIsSuccessState(false);
      setTimeout(() => {
        router.push({ pathname: handleRoute("liveness-fail"), query: { registerId: router.query.request_id } });
      }, 5000);
    }
  };

  const removeStorage = () => {
    localStorage.removeItem("tlk-reg-id");
    localStorage.removeItem("tlk-counter");
  }

  useEffect(() => {
    if (!isDone) return
    changePage()
  }, [isDone])

  useEffect(() => {
    if (!router.isReady) return
    generateAction()
    dispatch(resetImages())
  }, [router.isReady])

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
        <Camera currentActionIndex={currentActionIndex} setCurrentActionIndex={setCurrentActionIndex} currentStep='Liveness Detection' />
        <ProgressStepBar currentActionIndex={currentActionIndex} />
        <div className="flex items-center justify-center mt-5 flex-col">
          <span className="font-poppins font-medium">
            Wajah menghadap ke {actionText()}
          </span>
          <span className="text-center font-poppins text-sm text-neutral">Mohon jangan bergerak selama proses pengambilan wajah</span>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Liveness;
