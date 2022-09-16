import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import { assetPrefix } from "next.config";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Image from "next/image";
import { useRouter } from "next/router";

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
  } = router.query;

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
  return <div>list document</div>;
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
