import Image from "next/legacy/image";
import Head from "next/head";
import { assetPrefix } from "../../next.config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";
import Footer from "@/components/Footer";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import Heading from "@/components/atoms/Heading";
import Paragraph from "@/components/atoms/Paraghraph";

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
  const themeConfiguration = useSelector((state: RootState) => state.theme);

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
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeConfigurationAvaliabilityChecker(
          themeConfiguration?.data.background as string,
          "BG"
        ),
      }}
    >
      <Head>
        <title>Pengaturan Ulang Kata Sandi Berhasil</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 py-9 max-w-md mx-auto min-h-screen flex flex-col justify-center">
        <div className="text-center">
          <Heading className="text-center mb-3">
            Pengaturan Ulang Kata Sandi Berhasil
          </Heading>
          <div
            className="bg-contain mx-auto w-40 h-40 bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${themeConfigurationAvaliabilityChecker(
                themeConfiguration.data
                  .asset_forget_password_success as string,
                "ASSET",
                `${assetPrefix}/images/linkAccountSuccess.svg`
              )})`,
            }}
          ></div>
          <Paragraph size="sm" className="mt-4 text-center">
            Silahkan login kembali menggunakan Kata Sandi Anda yang terbaru
          </Paragraph>
          {autoRedirect && redirect_url && (
            <Paragraph size="sm" className="mt-4 text-center">
              Silahkan login ulang dalam {currentSecond} detik
            </Paragraph>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default LinkAccount;
