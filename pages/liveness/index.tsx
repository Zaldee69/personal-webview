import Image from "next/image";
import { useEffect, useState,  } from "react";
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

const Liveness = () => {
  const router = useRouter()
  const routerQuery = router.query

  const [isSuccessState, setIsSuccessState] = useState<boolean>(false);
  const images = useSelector((state: RootState) => state.liveness.images);
  const isDone = useSelector((state: RootState) => state.liveness.isDone);



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
        dispatch(setActionList(res.data.actionList))
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
        removeStorage();
        router.push({ pathname: "/form", query: { registerId: router.query.registerId } });
      } else {
        if (status !== "E" && status !== "F") {
          if (sessionStorage.getItem("tlk-reg-id") === router.query.registerId && parseInt(sessionStorage.getItem("tlk-counter") as string) >= 2) {
            setIsSuccessState(false);
            router.push({ pathname: "/liveness-fail", query: { registerId: router.query.registerId } });
            removeStorage();
          } else {
            setIsSuccessState(false);
            sessionStorage.setItem("tlk-failing", 'yes');
            setTimeout(() => {
              router.push({ pathname: "/liveness-fail", query: { registerId: router.query.registerId } });
            }, 5000);
          }

        } else {
          if (status) {
            removeStorage();
            if (status === "E") {
              setIsSuccessState(false);
            } else if (status === "F") {
              setIsSuccessState(false);
            }
          } else {
            setIsSuccessState(false)
          }
        }
      }
    } catch (e) {
      setIsSuccessState(false);
      setTimeout(() => {
        router.push({ pathname: "/liveness-fail/", query: { registerId: router.query.registerId } });
      }, 5000);
    }
  };

  const removeStorage = () => {
    sessionStorage.removeItem("tlk-reg-id");
    sessionStorage.removeItem("tlk-counter");
    sessionStorage.removeItem("tlk-failing");
  }

  useEffect(() => {
    if(isDone){
      changePage()
    }  
  })

  useEffect(() => {
    if(!router.isReady) return
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
        <Camera currentStep='Liveness Detection' />
        <ProgressStepBar />
        <div className="flex items-center justify-center mt-5 flex-col">
          <span className="font-poppins font-medium">
            Wajah menghadap ke depan
          </span>
          <span className="text-center font-poppins text-sm text-neutral">Mohon jangan bergerak selama proses pengambilan wajah</span>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Liveness;
