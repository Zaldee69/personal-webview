import FRCamera from "@/components/FRCamera";
import DownloadIcon from "@/public/icons/DownloadIcon";
import XIcon from "@/public/icons/XIcon";
import { RootState } from "@/redux/app/store";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { handleRoute } from "@/utils/handleRoute";
import { restSigning, RestSigningDownloadSignedPDF } from "infrastructure";
import { restGetOtp, restLogout } from "infrastructure/rest/b2b";
import { ISignedPDF } from "infrastructure/rest/signing/types";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { PinInput } from "react-input-pin-code";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface IParameterFromRequestSign {
  user?: string;
  id?: string;
  channel_id?: string;
  request_id?: string;
}
interface IModal {
  modal: boolean;
  setModal: Dispatch<SetStateAction<boolean>>;
  tilakaName?: string;
}

type TPropsSigning = {};

type TPropsSigningSuccess = { documentCount: number };

type TPropsSigningFailure = {
  documentName: string;
  error: { message: string };
};

const Signing = (props: TPropsSigning) => {
  const router = useRouter();
  const routerIsReady = router.isReady;
  const routerQuery: NextParsedUrlQuery & {
    isSuccess?: "0" | "1";
    redirect_url?: string;
    fr?: "1";
  } & IParameterFromRequestSign = router.query;

  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);
  const [documentList, setDocumentList] = useState<ISignedPDF[]>([]);

  const agreeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgree(e.target.checked);
  };

  const downloadOnClick = (pdfBase64: string, pdfName: string) => {
    toast.success(`Download Nama ${pdfName} berhasil`, { autoClose: 1000 });

    setTimeout(() => {
      var a = document.createElement("a");
      a.href = "data:application/pdf;base64," + pdfBase64;
      a.download = pdfName;
      a.click();
    }, 2000);
  };

  useEffect(() => {
    const token_v2 = localStorage.getItem("token_v2");
    if (!token_v2) {
      router.replace({
        pathname: handleRoute("/login/v2"),
        query: { ...router.query },
      });
    } else {
      setShouldRender(true);
    }
    if (token_v2 && routerIsReady) {
      RestSigningDownloadSignedPDF({
        request_id: routerQuery.request_id as string,
      })
        .then((res) => {
          if (res.success) {
            setDocumentList(res.signed_pdf);
          } else {
            toast(
              res.message || "Tidak berhasil pada saat memuat list dokumen",
              {
                type: "error",
                toastId: "error",
                position: "top-center",
                icon: XIcon,
              }
            );
          }
        })
        .catch((err) => {
          if (
            err.response?.data?.message &&
            err.response?.data?.data?.errors?.[0]
          ) {
            toast(
              `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
              {
                type: "error",
                toastId: "error",
                position: "top-center",
                icon: XIcon,
              }
            );
          } else {
            if (err.response.status === 401) {
              localStorage.removeItem("token_v2");
              localStorage.removeItem("refresh_token_v2");
              router.replace({
                pathname: handleRoute("/login/v2"),
                query: { ...router.query },
              });
            }
            toast(
              err.response?.data?.message ||
                "Kesalahan pada saat memuat list dokumen",
              {
                type: "error",
                toastId: "error",
                position: "top-center",
                icon: XIcon,
              }
            );
          }
        });
    }
  }, [routerIsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return;
  if (routerQuery.isSuccess === "1") {
    return <SigningSuccess documentCount={0} />;
  } else if (routerQuery.isSuccess === "0") {
    return (
      <SigningFailure
        documentName="Document-1.pdf"
        error={{ message: "Dokumen Expired" }}
      />
    );
  }
  return (
    <div>
      <FRModal modal={openFRModal} setModal={setopenFRModal} />
      <OTPModal modal={otpModal} setModal={setOtpModal} />

      <div className="px-10 py-8 text-center flex flex-col justify-center min-h-screen">
        <div>
          <p className="font-poppins text-lg font-semibold text-neutral800">
            Tanda Tangan Berhasil
          </p>
          <div className="mt-3">
            <Image
              src={`${assetPrefix}/images/signatureRequest.svg`}
              width="120px"
              height="120px"
              alt="signing-request-ill"
            />
          </div>
          <div className="mt-3 flex justify-center">
            <p
              className="font-poppins text-sm text-neutral800 text-left"
              style={{ maxWidth: "360px" }}
            >
              Anda menerima dokumen untuk ditandatangani. Mohon mencentang kotak
              di bawah untuk melanjutkan proses tanda tangan.
            </p>
          </div>
        </div>
        <div className="mt-6 mx-auto w-full" style={{ maxWidth: "360px" }}>
          <p className="font-poppins font-semibold text-sm text-neutral200 text-left">
            {documentList.length} Dokumen
          </p>
          <div className="flex justify-center">
            <div
              className="mt-2 border border-neutral50 p-4 rounded-md w-full overflow-y-auto"
              style={{ maxHeight: "190px" }}
            >
              {documentList.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between ${
                    i !== 0 ? "mt-4" : ""
                  }`}
                >
                  <p className="text-sm text-neutral800 truncate">
                    {e.pdf_name}
                  </p>
                  <button onClick={() => downloadOnClick(e.pdf, e.pdf_name)}>
                    <DownloadIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center mt-7" style={{ maxWidth: "360px" }}>
            <input
              id="agree"
              name="agree"
              type="checkbox"
              className="form-checkbox cursor-pointer text-primary"
              onChange={agreeOnChange}
            />
            <label
              className="ml-3 text-neutral800 font-poppins text-left text-sm cursor-pointer select-none"
              htmlFor="agree"
            >
              Saya telah membaca dan setuju untuk menandatangani dokumen di atas
            </label>
          </div>
        </div>
        <div className="mt-8">
          <button
            disabled={!agree}
            className="bg-primary disabled:bg-primary70 hover:opacity-50 disabled:hover:opacity-100 text-white disabled:text-neutral200 font-poppins rounded-md px-6 py-2.5"
            onClick={() =>
              ({
                response: {
                  data: { mfa: routerQuery.fr === "1" ? "fr" : "otp" },
                },
              }.response.data.mfa.toLowerCase() == "fr"
                ? setopenFRModal(true)
                : setOtpModal(true))
            }
          >
            Tanda Tangan
          </button>
        </div>
        <div className="mt-6">
          <div className="flex justify-center">
            <Image
              src={`${assetPrefix}/images/poweredByTilaka.svg`}
              alt="powered-by-tilaka"
              width="80px"
              height="41.27px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SigningSuccess = (props: TPropsSigningSuccess) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } = router.query;

  return (
    <div className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen">
      <div>
        <p className="font-poppins text-lg font-semibold text-neutral800">
          Tanda Tangan Berhasil
        </p>
        <div className="mt-3">
          <Image
            src={`${assetPrefix}/images/signingSuccess.svg`}
            width="196px"
            height="196px"
            alt="signing-success-ill"
          />
        </div>
        <div className="mt-3">
          <p className="font-poppins text-sm text-neutral800">
            {props.documentCount} dokumen berhasil ditandatangan.
          </p>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a href={concateRedirectUrlParams(routerQuery.redirect_url, "")}>
              <a>Kembali ke Halaman Utama</a>
            </a>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="80px"
            height="41.27px"
          />
        </div>
      </div>
    </div>
  );
};

const SigningFailure = (props: TPropsSigningFailure) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    redirect_url?: string;
  } & IParameterFromRequestSign = router.query;

  const params = {
    user_identifier: routerQuery.user,
    request_id: routerQuery.request_id,
    status: "Exp",
  };
  const queryString = new URLSearchParams(params as any).toString();

  return (
    <div className="px-10 pt-16 pb-9 text-center flex flex-col justify-center min-h-screen">
      <div>
        <p className="font-poppins text-lg font-semibold text-neutral800">
          Gagal Tanda Tangan
        </p>
        <div className="mt-3">
          <Image
            src={`${assetPrefix}/images/signingFailure.svg`}
            width="196px"
            height="196px"
            alt="signing-failure-ill"
          />
        </div>
        <div className="mt-3">
          <p className="font-poppins text-sm text-neutral800">
            Proses tanda tangan Nama {props.documentName} gagal.
          </p>
          <p className="font-poppins text-base text-neutral800 font-medium mt-1.5">
            {props.error.message}
          </p>
        </div>
      </div>
      <div className="mt-32">
        {routerQuery.redirect_url && (
          <div className="text-primary text-base font-medium font-poppins underline hover:cursor-pointer">
            <a
              href={concateRedirectUrlParams(
                routerQuery.redirect_url,
                queryString
              )}
            >
              <a>Kembali ke Halaman Utama</a>
            </a>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="80px"
            height="41.27px"
          />
        </div>
      </div>
    </div>
  );
};

const FRModal: React.FC<IModal | any> = ({ modal, setModal }) => {
  const router = useRouter();
  const routerQuery = router.query;
  const [isFRSuccess, setIsFRSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isFRSuccess && modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [isFRSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  return modal ? (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className="fixed z-50 flex items-start transition-all duration-1000 justify-center w-full left-0 top-0 h-full "
    >
      <div className="bg-white max-w-md mt-20 pt-5 px-2 pb-3 rounded-md w-full mx-5 ">
        {isFRSuccess ? (
          <div className="flex flex-col  items-center">
            <p className="font-poppins block text-center  whitespace-nowrap  font-semibold ">
              Tanda Tangan Berhasil
            </p>
            <div className="my-10">
              <Image
                width={150}
                height={150}
                src={`${assetPrefix}/images/successFR.svg`}
                alt="success-fr-ill"
              />
            </div>

            <button
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
              className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9 font-semibold hover:opacity-50"
            >
              Tutup
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
            <FRCamera
              setModal={setModal}
              setIsFRSuccess={setIsFRSuccess}
              signingFailedRedirectTo={handleRoute("/login/v2")}
              tokenIdentifier="token_v2"
            />
            <button
              onClick={() => setModal(!modal)}
              className="text-primary btn  bg-white font-poppins w-full mt-5 mx-auto rounded-sm h-9 font-semibold hover:opacity-50"
            >
              Batal
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;
};

const OTPModal: React.FC<IModal> = ({ modal, setModal }) => {
  const [successSigning, setSuccessSigning] = useState<boolean>(false);
  const document = useSelector((state: RootState) => state.document);
  const signature = useSelector((state: RootState) => state.signature);
  const router = useRouter();
  const { transaction_id, request_id, ...restRouterQuery } = router.query;

  const [values, setValues] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (modal && !successSigning) {
      restGetOtp({})
        .then((res) => {
          toast(`Kode OTP telah dikirim ke Email anda`, {
            type: "info",
            toastId: "info",
            isLoading: false,
            position: "top-center",
          });
        })
        .catch(() => {
          toast.error("Kode OTP gagal dikirim", { icon: <XIcon /> });
        });
    }
  }, [modal]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClickHandler = () => {
    toast(`Loading...`, {
      type: "info",
      toastId: "loading",
      isLoading: true,
      position: "top-center",
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
        setSuccessSigning(true);
        toast.dismiss("loading");
        localStorage.setItem("count_v2", "0");
      })
      .catch((err) => {
        toast.dismiss("loading");
        if (err.request.status === 401) {
          router.replace({
            pathname: "/login/v2",
            query: { ...router.query },
          });
        } else {
          toast.error("Kode OTP salah", { icon: <XIcon /> });
          setValues(["", "", "", "", "", ""]);
          const newCount =
            parseInt(localStorage.getItem("count_v2") as string) + 1;
          localStorage.setItem("count_v2", newCount.toString());
          const count = parseInt(localStorage.getItem("count_v2") as string);
          if (count >= 5) {
            localStorage.removeItem("token_v2");
            localStorage.setItem("count_v2", "0");
            restLogout({});
            router.replace({
              pathname: "/login/v2",
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
            <p className="font-poppins block text-center  whitespace-nowrap  font-semibold ">
              Tanda Tangan Berhasil
            </p>
            <div className="my-10">
              <Image
                width={150}
                height={150}
                src={`${assetPrefix}/images/successFR.svg`}
                alt="success-fr-ill"
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
              className="bg-primary btn  text-white font-poppins w-full mt-5 mx-auto rounded-sm h-9 font-semibold hover:opacity-50"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="font-poppins block text-center pb-5  whitespace-nowrap  font-semibold ">
              Goresan
            </p>
            <span className="font-poppins block text-center pb-5  ">
              Masukkan 6 digit OTP
            </span>
            <PinInput
              containerStyle={{
                alignItems: "center",
                gap: 5,
                marginTop: "10px",
              }}
              inputStyle={{ alignItems: "center", gap: 5, marginTop: "10px" }}
              placeholder=""
              size="lg"
              values={values}
              onChange={(value, index, values) => setValues(values)}
            />
            <button
              disabled={values.join("").length < 6}
              onClick={onClickHandler}
              className="bg-primary btn mt-16 disabled:opacity-50 text-white font-poppins mx-auto rounded-sm py-2.5 px-6 font-semibold"
            >
              Konfirmasi
            </button>
            <button
              onClick={() => {
                setValues(["", "", "", "", "", ""]);
                setModal(!modal);
              }}
              className="  text-primary font-poppins mt-4 hover:opacity-50 w-full mx-auto rounded-sm h-9 font-semibold"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default Signing;
