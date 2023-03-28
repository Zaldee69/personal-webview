import Image from "next/image";
import Head from "next/head";
import { assetPrefix } from "../../next.config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";

type Props = {};

/**
 * Fitur auto-redirect perlu penyesuaian dari BE
 *
 * /pRequestResetPassword
 * {
 *   email?: string;
 *   recaptcha_response?: string;
 *   redirect_url?: string;
 * }
 *
 * Email
 * /reset-password?kunciRahasia=rahasia&redirect_url=http%253A%252F%252Flocalhost%253A3000%252Flogin
 */
const autoRedirect = false;
const timeoutInSecond = 5;

const LinkAccount = (props: Props) => {
  const router = useRouter();
  const [currentSecond, setCurrentSecond] = useState(timeoutInSecond);

  const { redirect_url } = router.query;

  useEffect(() => {
    if (!router.isReady || !redirect_url || !autoRedirect) return;
    if (currentSecond <= 0) {
      const params = {};
      const queryString = new URLSearchParams(params as any).toString();
      window.top!.location.href = concateRedirectUrlParams(
        redirect_url as string,
        queryString
      );
      return;
    }

    const interval = setInterval(() => {
      setCurrentSecond(currentSecond - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [router.isReady, currentSecond]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>Pengaturan Ulang Kata Sandi Berhasil</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 py-9 max-w-md mx-auto min-h-screen flex flex-col justify-center">
        <div className="text-center">
          <p className="font-poppins text-lg font-normal text-neutral800 text-center">
            Pengaturan Ulang Kata Sandi Berhasil
          </p>
          <div className="mt-12">
            <Image
              src={`${assetPrefix}/images/linkAccountSuccess.svg`}
              width="151px"
              height="151px"
              alt="liveness-success-ill"
            />
          </div>
          <p className="mt-4 font-poppins text-sm font-normal text-neutral800 text-center">
            Silahkan login kembali menggunakan Kata Sandi Anda yang terbaru
          </p>
          {autoRedirect && redirect_url && (
            <p className="mt-4 font-poppins text-sm font-normal text-neutral800 text-center">
              Silahkan login ulang dalam {currentSecond} detik
            </p>
          )}
        </div>
        <div className="mt-32 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="80px"
            height="41.27px"
          />
        </div>
      </div>
    </>
  );
};

export default LinkAccount;
