import Image from "next/image";
import { Viewer } from "./../../components/Viewer";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import FRCamera from "../../components/FRCamera";
import SignaturePad from "./../../components/SignaturePad";
import Footer from "../../components/Footer";
import Head from "next/head";

interface Active {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
}

const Signing = () => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [openScratchesModal, setOpenScratchesModal] = useState<boolean>(false);
  const [selectFontModal, setSelectFontModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  return (
    <>
      <Head>
        <title>Tanda Tangan</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {isLoading ? (
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
        <div className="px-5 pt-8 sm:w-full md:w-4/5 relative  mx-auto">
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
          <Viewer setTotalPages={setTotalPages} url="/images/pinjaman.pdf" />
          <button
            onClick={() => setopenFRModal(true)}
            className="bg-primary btn md:mx-auto md:block md:w-1/4 my-10 text-white font-poppins w-full mx-auto rounded-sm h-9"
          >
            TANDA TANGANI
          </button>
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
    <div className="flex flex-row items-center z-10 left-0 fixed py-5 w-full top-0 bg-[rgb(223,225,230)] justify-center gap-10">
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

const FRModal: React.FC<Active> = ({ modal, setModal }) => {
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);

  if (modal) {
    setTimeout(() => {
      setIsFRSuccess(true);
    }, 5000);
  }

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
              onClick={() => setModal(!modal)}
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
          <div className="flex gap-3 items-center justify-center">
            <button className="font-allan w-2/4 rounded-md py-3 border-[#DFE1E6] border transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
            <button className="font-aguafinaScript w-2/4 rounded-md border py-3 border-[#DFE1E6] transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
          </div>
          <div className="flex gap-3 items-center justify-center">
            <button className="font-architectsDaughter w-2/4 rounded-md py-3 border-[#DFE1E6] border transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
            <button className="font-giveYouGlory w-2/4 rounded-md border py-3 border-[#DFE1E6] transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
          </div>
          <div className="flex gap-3 items-center justify-center">
            <button className="font-berkshireSwash w-2/4 rounded-md py-3 border-[#DFE1E6] border transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
            <button className="font-missFajardose w-2/4 rounded-md border py-3 border-[#DFE1E6] transition-all duration-500 focus:border-[#1A73E8] text-2xl">
              M. Rizaldy
            </button>
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
          className="  text-[#97A0AF]  font-poppins w-full  mx-auto rounded-sm h-9"
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
