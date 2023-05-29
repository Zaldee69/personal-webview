/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { store } from "../redux/app/store";
import { Provider } from "react-redux";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.min.css";
import "../styles/globals.css";
import Script from "next/script";
import i18n from "../i18";
import { useEffect, useState } from "react";
import DisconnectModal from "@/components/atoms/DisconnectModal";
import { initialStateCertificateSlice } from "@/redux/slices/certificateSlice";
import { initialStateDocumentSlice } from "@/redux/slices/documentSlice";
import { initialStateLivenessSlice } from "@/redux/slices/livenessSlice";
import { initialStateLoginSlice } from "@/redux/slices/loginSlice";
import { initialStateSignatureSlice } from "@/redux/slices/signatureSlice";
import { getTheme, intialStateThemeSlice } from "@/redux/slices/themeSlice";
import Head from "next/head";

type TcontextClass = {
  success: string;
  error: string;
  info: string;
  warning: string;
  default: string;
  dark: string;
};

const contextClass: TcontextClass = {
  success:
    "Toastify__toast-success bg-green50 text-neutral800 border border-green200",
  error: "Toastify__toast-error bg-red50 text-neutral800 border border-red75",
  info: "bg-primary text-white",
  warning: "bg-warning text-neutral800",
  default: "bg-neutral200 text-white",
  dark: "bg-neutral800 text-white",
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { lang } = router.query;

  i18n.changeLanguage(lang as string);

  const getThemeConfiguration = () => {
    store.dispatch(
      getTheme({
        type: router.query.channel_id
          ? "channel_id"
          : router.query.request_id
          ? "request_id"
          : "channel_id",
        uuid:
          (router.query.channel_id as string) ||
          (router.query.request_id as string),
      })
    );
  };

  const [showChild, setShowChild] = useState<boolean>(false);
  const [style, setStyle] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;
    getThemeConfiguration();
  }, [router.isReady]);

  store.subscribe(() => {
    if (store.getState().theme.status === "PENDING") return;
    setShowChild(true);
    setStyle(`* {
      font-family: "${store.getState().theme.data.font_family}"!important
    }`);
  });

  if (!showChild) {
    return null;
  }

  if (typeof window === "undefined") {
    return <></>;
  } else {
    return (
      <>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href={`https://fonts.googleapis.com/css2?family=${
              !store.getState().theme.data.font_family
                ? `Poppins`
                : store.getState().theme.data.font_family
            }&display=swap`}
            rel="stylesheet"
          />
        </Head>
        <style jsx global>
          {`
            ${store.getState().theme.data.font_family && style}

            ::placeholder {
              color: ${!store.getState().theme.data.font_color
                ? "rgba(193, 199, 208, 1)"
                : store.getState().theme.data.font_color} !important;
            }
          `}
        </style>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.js"
          strategy="beforeInteractive"
        ></Script>
        <DisconnectModal />
        <Provider
          store={store}
          serverState={{
            certificate: initialStateCertificateSlice,
            document: initialStateDocumentSlice,
            liveness: initialStateLivenessSlice,
            login: initialStateLoginSlice,
            signature: initialStateSignatureSlice,
            theme: intialStateThemeSlice,
          }}
        >
          <ToastContainer
            toastClassName={(context: any) =>
              contextClass[
                (context?.type || "default") as keyof TcontextClass
              ] +
              " relative  rounded items-center w-fit px-5 mx-auto mt-5 text-sm overflow-hidden hover:cursor-pointer flex justify-between"
            }
            bodyClassName={() =>
              "text-sm poppins-regular  p-3 flex items-center"
            }
            position="top-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            closeButton={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Component {...pageProps} />
        </Provider>
      </>
    );
  }
}

export default MyApp;
