import Image from "next/image";
import { useEffect, useState, } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { AppDispatch, RootState } from "@/redux/app/store";
import Camera from "../../components/Camera";
import { useRouter } from "next/router";
import { toast } from 'react-toastify'
import { RestKycGenerateAction, RestKycVerification } from '../../infrastructure'
import { TKycVerificationRequestData } from '../../infrastructure/rest/kyc/types'


import Footer from "../../components/Footer";
import ProgressStepBar from "../../components/ProgressStepBar";
import { setActionList } from "@/redux/slices/livenessSlice";
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
      registerId: routerQuery.registerId as string
    }
    toast(`Mengecek status...`, {
      type: 'info',
      toastId: 'generateAction',
      isLoading: true,
      position: 'top-center',
    })
    RestKycGenerateAction(body).then((res) => {
      if (res?.data) {
        const payload = ['look_straight'].concat(res.data.actionList)
        dispatch(setActionList(payload))
        toast(`${res.message}`, {
          type: 'success',
          position: 'top-center',
          autoClose: 3000,
        })
        toast.dismiss('generateAction')
      } else {
        throw new Error(res.message)
      }
    }).catch((err) => {
      toast.dismiss('generateAction')
      toast(
        `${err || 'Tidak merespon!'
        }`,
        {
          type: 'error',
          autoClose: err
            ? 5000
            : false,
          position: 'top-center',
        }
      )
    })
  }

  const changePage = async () => {
    toast(`Mengecek status...`, {
      type: 'info',
      toastId: 'verification',
      isLoading: true,
      position: 'top-center',
    })
    sessionStorage.setItem("tlk-reg-id", router.query.registerId as string)
    sessionStorage.setItem("tlk-counter", '0')

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
        router.push({ pathname: handleRoute("/form"), query: { registerId: router.query.registerId } });
      } else {
        toast.dismiss('verification')
        if (status !== "E" && status !== "F") {
          if (sessionStorage.getItem("tlk-reg-id") === router.query.registerId && parseInt(sessionStorage.getItem("tlk-counter") as string) >= 2) {
            setIsSuccessState(false);
            toast(
              "You have failed 3 times \nYou will be redirected to the next page, please wait...",
              {
                type: 'error',
                autoClose: 5000,
                position: 'top-center',
              }
            )
            router.push({ pathname: handleRoute("/liveness-fail"), query: { registerId: router.query.registerId } });
            sessionStorage.removeItem("tlk-reg-id");
          } else {
            setIsSuccessState(false);
            toast(
              "Live Detection failed. Please try again",
              {
                type: 'error',
                autoClose: 5000,
                position: 'top-center',
              }
            )
            let attempt = parseInt(sessionStorage.getItem('tlk-counter') as string) + 1
            sessionStorage.setItem('tlk-counter', attempt.toString())
            setTimeout(() => {
              router.push({ pathname: handleRoute("/liveness-fail"), query: { registerId: router.query.registerId } });
            }, 5000);
          }

        } else {
          if (status) {
            removeStorage();
            if (status === "E") {
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
                'Registration Gagal',
                {
                  type: 'error',
                  autoClose: 5000,
                  position: 'top-center',
                }
              )
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
        router.push({ pathname: handleRoute("/liveness-fail"), query: { registerId: router.query.registerId } });
      }, 5000);
    }
  };

  const removeStorage = () => {
    sessionStorage.removeItem("tlk-reg-id");
    sessionStorage.removeItem("tlk-counter");
  }

  useEffect(() => {
    if (isDone) {
      changePage()
    }
  })

  useEffect(() => {
    if (!router.isReady) return
    generateAction()
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
