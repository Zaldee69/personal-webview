import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { store } from "../redux/app/store";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.min.css";
import "../styles/globals.css";
import Script from "next/script";

type TcontextClass = {
  success: string;
  error: string;
  info: string;
  warning: string;
  default: string;
  dark: string;
};

const contextClass: TcontextClass = {
  success: "bg-success text-white",
  error: "bg-red50 text-neutral800 border border-red75",
  info: "bg-primary text-white",
  warning: "bg-warning text-neutral800",
  default: "bg-white text-neutral800",
  dark: "bg-neutral800 text-white",
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.js"></Script>
      <Provider store={store}>
        <ToastContainer
          toastClassName={(context: any) =>
            contextClass[(context?.type || "default") as keyof TcontextClass] +
            " relative p-1 min-h-10 rounded text-sm overflow-hidden hover:cursor-pointer flex justify-between"
          }
          bodyClassName={() => "text-sm font-poppins p-3 flex items-center"}
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

export default MyApp;
