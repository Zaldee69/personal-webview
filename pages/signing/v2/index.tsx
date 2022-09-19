import DownloadIcon from "@/public/icons/DownloadIcon";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { FRModal, OTPModal } from "..";

type TPropsSigning = {};

type TPropsSigningSuccess = { documentCount: number };

type TPropsSigningFailure = {
  documentName: string;
  error: { message: string };
};

const Signing = (props: TPropsSigning) => {
  const router = useRouter();
  const routerQuery: NextParsedUrlQuery & {
    isSuccess?: "0" | "1";
    redirect_url?: string;
    fr?: "1";
  } = router.query;

  const [agree, setAgree] = useState<boolean>(false);
  const [openFRModal, setopenFRModal] = useState<boolean>(false);
  const [otpModal, setOtpModal] = useState<boolean>(false);

  const agreeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.checked);
    setAgree(e.target.checked);
  };

  const downloadOnClick = (id: string) => {
    toast.success("Download Nama Dokumen.pdf berhasil");
  };

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
            12 Dokumen
          </p>
          <div className="flex justify-center">
            <div
              className="mt-2 border border-neutral50 p-4 rounded-md w-full overflow-y-auto"
              style={{ maxHeight: "190px" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral800">Dokumen.pdf</p>
                <button onClick={() => downloadOnClick("1")}>
                  <DownloadIcon />
                </button>
              </div>
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
  } = router.query;

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

export { SigningSuccess };

export default Signing;
