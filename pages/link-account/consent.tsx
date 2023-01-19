import Image from "next/image";
import { useRouter } from "next/router";
import { assetPrefix } from "../../next.config";
import i18n from "i18";

type Props = {};

const LinkAccountConsent = (props: Props) => {
  const router = useRouter();
  const { t }: any = i18n;

  const onApprove = () => {
    console.log("approve");
    // call api
    // then to penautan success
    // catch to penautan failure with status=F&reason=user already exist
  };

  const onReject = () => {
    console.log("reject");
    // call api
    // redirect with status=F&reason=reject by user pada redirect url
  };

  return (
    <div className="bg- min-h-screen flex justify-center items-center">
      <div className="sm:overflow-scroll lg:overflow-hidden rounded max-w-3xl px-6 pt-4 pb-6 bg-white shadow-lg">
        <div className="bg-neutral10 px-4 sm:px-10 md:px-16 pt-4 pb-6">
          <p className="text-lg sm:text-xl md:text-2xl font-normal text-center text-neutral800">
            {t("page")}{" "}
            <span className="italic">{t("customerConsentText")}</span>
          </p>
          <div className="mt-3 text-center">
            <Image
              src={`${assetPrefix}/images/customerConsent.svg`}
              width="152px"
              height="151px"
              alt="customerConsent"
            />
          </div>
          <p className="mt-3 text-center font-normal text-neutral800 text-sm">
            {t("linkAccountConsentText")}
          </p>
        </div>
        <div className="flex justify-end mt-5">
          <button
            onClick={onReject}
            className="bg-white text-primary hover:opacity-50  px-6 py-2.5 rounded hover:cursor-pointer"
          >
            {t("cancel")}
          </button>
          <a
            onClick={onApprove}
            className="block bg-primary hover:opacity-50 text-white px-6 py-2.5 rounded hover:cursor-pointer"
          >
            {t("next")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkAccountConsent;
