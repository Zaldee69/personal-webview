import React, { useState } from "react";
import i18n from "i18";
import { assetPrefix } from "next.config";
import useNavigatorOnline from "hooks/useNavigatorOnline";

const DisconnectModal = () => {
  const { t }: any = i18n;
  const status = useNavigatorOnline();
  const [show, setShow] = useState(true);

  return (
    <div
      style={{ backgroundColor: "rgba(0, 0, 0, .5)" }}
      className={`fixed z-50 items-center transition-all duration-1000 pb-3 justify-center w-full left-0 top-0 h-full ${
        !status && show ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white max-w-md font-poppins pt-5 p-2 pb-3 rounded-md w-full mx-5 ">
        <div className="px-5 py-5 flex justify-start gap-5 items-start">
          <img
            src={`${assetPrefix}/images/danger.jpg`}
            alt="danger"
            style={{ height: "1.3rem", width: "2rem" }}
          />
          <div>
            <p>{t("offlineModal.title")}</p>
            <p className="mt-5 text-sm text-[#505F79]">
              {t("offlineModal.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex justify-end mr-10">
          <button
            onClick={() => setShow(false)}
            className="bg-primary btn my-5 disabled:bg-[#DAE6F8] disabled:text-[#6B778C]/30 hover:opacity-70 text-white font-poppins rounded py-2 px-5 font-semibold"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectModal;
