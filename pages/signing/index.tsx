import { Viewer } from "@/components/Viewer";
import { useDispatch, useSelector } from "react-redux";
import { getDocument } from "@/redux/slices/documentSlice";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/redux/app/store";
import { TDocumentProps } from "@/interface/interface";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Head from "next/head";
import FRCamera from "@/components/FRCamera";
import SignaturePad from "@/components/SignaturePad";
import Footer from "@/components/Footer";
import { setAuthToken } from "@/config/API";

type TFontSig =
| "signature_font_type_allan"
| "signature_font_type_aguafinaScript"
| "signature_font_type_architectsDaughter"
| "signature_font_type_giveYouGlory"
| "signature_font_type_berkshireSwash"
| "signature_font_type_missFajardose";

interface Active {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
}

interface Props {
  token: string;
  pathname: string;
}

const Signing = () => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [openScratchesModal, setOpenScratchesModal] = useState<boolean>(false);
  const [selectFontModal, setSelectFontModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const router = useRouter();
  const routerIsReady = router.isReady;
  const pathname = router.pathname;
  const { company_id, transaction_id } = router.query;

  const dispatch: AppDispatch = useDispatch();
  const res = useSelector((state: RootState) => state.document);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if(!token){
       router.replace({
      pathname: "/login",
      query: { ...router.query },
    });
    }
    setAuthToken({token, pathname} as Props)
    if(routerIsReady) dispatch(getDocument({company_id, transaction_id} as TDocumentProps))
  }, [routerIsReady]);

  return (
    <>
      <Head>
        <title>Tanda Tangan</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {res.response.status === "PENDING" ? (
        <>
          {" "}
          <div className="flex justify-center relative h-[45rem] items-center ">
            <Image
              alt="loading"
              width={50}
              height={50}
              src="/images/Loader.svg"
              className=" motion-safe:animate-spin"
            />
          </div>
          <Footer />
        </>
      ) : (
        <div className=" pt-8 sm:w-full bg-[#f4f5f7] md:w-4/5 relative  mx-auto">
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
          />
          <ChooseScratchModal
            modal={openScratchesModal}
            setModal={setOpenScratchesModal}
          />
          <OTPModal modal={otpModal} setModal={setOtpModal} />
          <Viewer setTotalPages={setTotalPages} url={`{data:application/pdf;base64,${res.response.data.document}`}    />
        <div className="px-5" >
          <button
            onClick={() => res.response.data.mfa === "FR" ? setopenFRModal(true) : setOtpModal(true)}
            className="bg-primary btn md:mx-auto md:block md:w-1/4 my-10 text-white font-poppins w-full mx-auto rounded-sm h-9"
          >
            TANDA TANGANI
          </button>
        </div>
        </div>
      )}
    </>
  );
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
  return (
    <div className="flex flex-row items-center shadow-xl z-10 left-0 fixed py-2 w-full top-0 bg-[rgb(223,225,230)] justify-center gap-10">
      <div className="flex flex-col  ">
        <button onClick={() => setOpenScratchesModal(!openScratchesModal)}>
          <Image width={25} height={25} src="/images/goresan.svg" />
          <p className="text-[#727272] text-base  ">Goresan</p>
        </button>
      </div>
      <div className="flex flex-col">
        <button onClick={() => setSelectFontModal(!selectFontModal)}>
          <Image width={25} height={25} src="/images/font.svg" />
          <p className="text-[#727272] text-base ">Font</p>
        </button>
      </div>
    </div>
  );
};

const FRModal: React.FC<Active | any> = ({ modal, setModal }) => {
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);

  if (modal) {
    setTimeout(() => {
      setIsFRSuccess(true);
    }, 5000);
  }

  useEffect(() => {
    if(isFRSuccess && modal){
      document.body.style.overflow = "hidden"
    }else {
      document.body.style.overflow = "scroll"
    }
  },[isFRSuccess])

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        {isFRSuccess ? (
          <div className="flex flex-col  items-center">
            <p className="font-poppins block text-center  whitespace-nowrap  font-semibold ">
              Tanda Tangan Berhasil
            </p>
            <div className="my-10">
              <Image width={150} height={150} src="/images/successFR.svg" />
            </div>

            <button
              onClick={() => {
                setModal(!modal)
                setIsFRSuccess(false)
              }}
              className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9"
            >
              TUTUP
            </button>
          </div>
        ) : (
          <>
            <p className="font-poppins block text-center font-semibold ">
              Konfirmasi Tanda Tangan
            </p>
            <span className="font-poppins mt-2 block text-center text-sm font-normal">
              Arahkan wajah ke kamera untuk otentikasi
            </span>
            <FRCamera />
            <button
              onClick={() => setModal(!modal)}
              className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9"
            >
              BATAL
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;
};

const ChooseFontModal: React.FC<Active> = ({ modal, setModal }) => {
  const [form, formSetter] = useState<TFontSig | string>("signature_font_type_aguafinaScript")
  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter(e.currentTarget.value);
  };
  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-2">
        <p className="font-poppins block text-center  whitespace-nowrap  font-semibold ">
          Pilih Font
        </p>
        <div className="mt-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 mt-5">
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_allan"
                onChange={handleFormOnChange}
                checked={
                  form === "signature_font_type_allan"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl font-allan text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_aguafinaScript"
                onChange={handleFormOnChange}
                checked={
                  form ===
                  "signature_font_type_aguafinaScript"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl font-aguafinaScript text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_architectsDaughter"
                onChange={handleFormOnChange}
                checked={
                  form ===
                  "signature_font_type_architectsDaughter"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-lg font-architectsDaughter text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_giveYouGlory"
                onChange={handleFormOnChange}
                checked={
                  form ===
                  "signature_font_type_giveYouGlory"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-base font-giveYouGlory text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_berkshireSwash"
                onChange={handleFormOnChange}
                checked={
                  form ===
                  "signature_font_type_berkshireSwash"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl font-berkshireSwash text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
              <input
                type="radio"
                name="signature_font_type"
                value="signature_font_type_missFajardose"
                onChange={handleFormOnChange}
                checked={
                  form ===
                  "signature_font_type_missFajardose"
                }
                className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
              />
              <p className="text-2xl font-missFajardose text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
          </div>
        </div>        
          <button
            onClick={() => setModal(!modal)}
            className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9"
          >
            TERAPKAN
          </button>
          <button
            onClick={() => setModal(!modal)}
            className="  text-[#97A0AF]  font-poppins w-full  mx-auto rounded-sm h-9"
          >
            BATAL
          </button>
        </div>
      </div>
  ) : null;
};

const ChooseScratchModal: React.FC<Active> = ({ modal, setModal }) => {
  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-2">
        <p className="font-poppins block text-center  whitespace-nowrap  font-semibold ">
          Goresan
        </p>
        <SignaturePad />
        <button
          onClick={() => setModal(!modal)}
          className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9"
        >
          TERAPKAN
        </button>
        <button
          onClick={() => setModal(!modal)}
          className="  text-[#97A0AF]  font-poppins w-full mt-3  mx-auto rounded-sm h-9"
        >
          BATAL
        </button>
      </div>
    </div>
  ) : null;
};

const OTPModal: React.FC<Active> = ({ modal, setModal }) => {
  const numberOnly = (e: ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = numbers;
  };

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-2">
        <p className="font-poppins block text-center pb-5  whitespace-nowrap  font-semibold ">
          Goresan
        </p>
        <span className="font-poppins block text-center pb-5  ">
          Masukkan 6 digit OTP
        </span>
        <input
          onChange={(e) => numberOnly(e)}
          maxLength={6}
          name="otpInput"
          type={"text"}
          className={`font-poppins py-3 focus:outline-none border-borderColor focus:ring  placeholder:text-placeholder placeholder:font-light  px-2 rounded-md border  w-full`}
        />
        <button
          onClick={() => setModal(!modal)}
          className="bg-primary btn mt-20  text-white font-poppins w-full mx-auto rounded-sm h-9"
        >
          TERAPKAN
        </button>
        <button
          onClick={() => setModal(!modal)}
          className="  text-[#97A0AF]  font-poppins w-full mt-4  mx-auto rounded-sm h-9"
        >
          BATAL
        </button>
      </div>
    </div>
  ) : null;
};
