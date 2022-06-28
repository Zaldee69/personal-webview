import {
  restSetDefaultSignature,
  restSetDefaultMFA,
  getUserName
} from "infrastructure/rest/b2b";
import {  useState, useRef, useEffect } from "react";
import SignaturePad from "../../components/SignaturePad";
import InfoIcon from "../../public/icons/InfoIcon";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import {TUserData} from "@/interface/interface"

type Props = {};

type Tform = {
  signature_type: 0 | 1;
  signature_font_type?:
    | "signature_font_type_allan"
    | "signature_font_type_aguafinaScript"
    | "signature_font_type_architectsDaughter"
    | "signature_font_type_giveYouGlory"
    | "signature_font_type_berkshireSwash"
    | "signature_font_type_missFajardose"
    | "";
  mfa_method: "fr" | "otp" | "otp_ponsel";
};

function SettingSignatureAndMFA({}: Props) {
  const [form, formSetter] = useState<Tform>({
    signature_type: 1,
    signature_font_type: "signature_font_type_allan",
    mfa_method: "fr",
  });
  const [imageURL, setImageURL] = useState<string>();
  const [data, setData] = useState<string>()
  let ref: any = null;
  const sigPad = useRef<any>();
  const router = useRouter();
  const [showModalOtpPonsel, showModalOtpPonselSetter] =
    useState<boolean>(false);
  const [agreeOtpPonsel, agreeOtpPonselSetter] = useState<boolean>(false);
  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
    ref = e.currentTarget;
    convertToDataURL();
  };

  useEffect(() => {
    if (router.isReady) {
      getUserName({}).then((res) => {
      const data = JSON.parse(res.data)
      setData(data.name)
    })
    } 
  }, [router.isReady]);


  //Convert HTML element to base64 png
  const convertToDataURL = async () => {
    const canvas = await html2canvas(ref.parentNode.children[1], {
      height: 60,
      backgroundColor : "rgba(0, 0, 0, 0)"
    });
    canvas.style.backgroundColor = "rgba(0, 0, 0, 0)"
    const image = canvas.toDataURL("image/png");
    setImageURL(image);
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    toast(`Loading...`, {
      type: "info",
      toastId: "info",
      isLoading: true,
      position: "top-center",
    });
    const signature_image = sigPad.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    const target = e.target as typeof e.target & {
      signature_type: { value: Tform["signature_type"] };
      signature_font_type: { value: Tform["signature_font_type"] };
      mfa_method: { value: Tform["mfa_method"] };
    };

    const signature_type = target.signature_type.value;
    const font_type = target.signature_font_type.value;
    const mfa_type = target.mfa_method.value;

    const payload = {
      signature_type,
      font_type: signature_type == 0 ? "" : font_type,
      signature_image:
        signature_type == 1 ? (imageURL as string) : signature_image,
    };

    if (signature_type == 0 && sigPad.current.isEmpty()) {
      toast.dismiss("info");
      toast("Tanda tangan goresan tidak boleh kosong!", {
        type: "error",
        toastId: "error",
        position: "top-center",
        icon: XIcon,
      });
    } else {
      restSetDefaultSignature({
        payload,
      })
        .then((res) => {
          if (res.success) {
            toast.dismiss("info");
            toast(res.message, {
              type: "success",
              toastId: "success",
            });
            setTimeout(() => {
              toast.dismiss("success");
              router.replace({
                pathname: "/signing",
                query: { ...router.query },
              });
            }, 3000);
          } else {
            toast.dismiss("info");
            toast(res.message, {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
          }
        })
        .catch((err) => {
          if (err.request.status === 401) {
            toast.dismiss("info");
            toast("Anda harus login terlebih dahulu", {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
            router.replace({
              pathname: "/login",
              query: { ...router.query },
            });
          } else {
            toast.dismiss("info");
            toast("Penggantian tanda tangan gagal", {
              type: "error",
              toastId: "error",
              position: "top-center",
              icon: XIcon,
            });
          }
        });
    }

    restSetDefaultMFA({
      payload: {
        mfa_type,
      },
    }).then((res) => {
      return res
    }).catch((err) => {
      {}
    })
  };

  return (
    <>
      <Head>
        <title>Pengaturan Tanda Tangan Dan MFA</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="bg-white p-4 font-poppins">
        <form onSubmit={handleFormOnSubmit}>
          <div className="flex justify-center">
            <img src="/images/ttdSetting.svg" alt="ill" />
          </div>
          <p className="text-md text-neutral800">Pilih tipe tanda tangan</p>
          <div className="mt-2 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs text-blue500 ml-4">
              Tanda tangan yang dipilih akan digunakan di dalam dokumen yang
              Anda tandatangani.
            </p>
          </div>
          <div className="mt-5">
            <label className="flex items-center">
              <input
                name="signature_type"
                value={0}
                onChange={handleFormOnChange}
                checked={form.signature_type == 0}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 text-_030326">
                Tanda tangan goresan
              </p>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                name="signature_type"
                value={1}
                onChange={handleFormOnChange}
                checked={form.signature_type == 1}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 text-_030326">Tanda tangan font</p>
            </label>
          </div>
          <div className={form.signature_type == 0 ? undefined : "hidden"}>
            <SignaturePad sigPad={sigPad} />
          </div>
          <div className={form.signature_type == 1 ? undefined : "hidden"}>
            <div className={`grid  ${data?.length as number > 15 ? "grid-cols gap-5" : "grid-col-2"} gap-3 mt-5`}>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_allan"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type === "signature_font_type_allan"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-2xl font-allan text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_aguafinaScript"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type ===
                    "signature_font_type_aguafinaScript"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-2xl font-aguafinaScript text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_architectsDaughter"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type ===
                    "signature_font_type_architectsDaughter"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-lg font-architectsDaughter text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_giveYouGlory"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type ===
                    "signature_font_type_giveYouGlory"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-base font-giveYouGlory text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_berkshireSwash"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type ===
                    "signature_font_type_berkshireSwash"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-2xl font-berkshireSwash text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
              <label className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="signature_font_type"
                  value="signature_font_type_missFajardose"
                  onChange={handleFormOnChange}
                  checked={
                    form.signature_font_type ===
                    "signature_font_type_missFajardose"
                  }
                  className="appearance-none border border-_B6B6B6 checked:border-_1A73E8 rounded-md w-full h-12"
                />
                <p className="text-2xl font-missFajardose text-_030326 absolute w-fit text-center">
                  {data}
                </p>
              </label>
            </div>
          </div>
          <p className="text-md text-neutral800 mt-8">
            Pilih metode otentikasi
          </p>
          <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
            <div className="pt-1">
              <InfoIcon />
            </div>
            <p className="text-xs text-blue500 ml-4">
              Untuk meningkatkan keamanan, diperlukan{" "}
              <i>Multi Factor Authentication</i> yang harus Anda gunakan saat
              melakukan aktivitas tandatangan digital ataupun aktivitas lainnya
              di tilaka.id. Silakan pilih metode MFA yang sesuai dengan
              kenyamanan Anda.
            </p>
          </div>
          <div className="mt-6">
            <label className="flex items-center">
              <input
                name="mfa_method"
                value="fr"
                onChange={handleFormOnChange}
                checked={form.mfa_method === "fr"}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 text-_030326">Face Recognition</p>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                name="mfa_method"
                value="otp"
                onChange={handleFormOnChange}
                checked={form.mfa_method === "otp"}
                type="radio"
                className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 text-_030326">OTP via Email</p>
            </label>
            <label className="flex items-center mt-3.5">
              <input
                disabled
                name="mfa_method"
                value="mfa_method_otp_ponsel"
                onChange={agreeOtpPonsel ? handleFormOnChange : undefined}
                onClick={
                  agreeOtpPonsel
                    ? undefined
                    : (_: React.MouseEvent<HTMLInputElement>) => {
                        showModalOtpPonselSetter(true);
                      }
                }
                checked={form.mfa_method === "otp_ponsel"}
                type="radio"
                className="appearance-none disabled:opacity-50 bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
              />
              <p className="text-md ml-2.5 opacity-50 text-_030326">
                OTP via Ponsel
              </p>
            </label>
          </div>
          <button
            type="submit"
            className="mt-8 p-3 text-base text-white bg-primary w-full"
          >
            LANJUT
          </button>
          <div className="mt-8 flex justify-center">
            <img src="/images/poweredByTilaka.svg" alt="powered-by-tilaka" />
          </div>
        </form>
        <div
          className={[
            `${showModalOtpPonsel ? "flex" : "hidden"}`,
            "fixed left-0 top-0 justify-center items-center inset-0 z-50",
          ].join(" ")}
        >
          <div className="absolute bg-black opacity-80 inset-0 z-0"></div>
          <div className="w-full max-w-352px px-3 py-5 relative mx-auto my-auto rounded-xl shadow-lg bg-white ">
            <div className="">
              <div className="text-center flex-auto justify-center">
                <p className="text-base text-neutral800">
                  Untuk mengirimkan OTP via Ponsel, maka Anda perlu membagikan
                  informasi Nomor Ponsel yang terdaftar di Dana Bagus kepada
                  Tilaka. Apakah Anda setuju?
                </p>
              </div>
              <div className="mt-10">
                <button
                  onClick={(_: React.MouseEvent<HTMLButtonElement>) => {
                    agreeOtpPonselSetter(true);
                    showModalOtpPonselSetter(false);
                    formSetter({ ...form, mfa_method: "otp_ponsel" });
                  }}
                  className="text-white bg-primary p-2.5 w-full rounded-sm"
                >
                  SETUJU
                </button>
                <button
                  onClick={(_: React.MouseEvent<HTMLButtonElement>) => {
                    agreeOtpPonselSetter(false);
                    showModalOtpPonselSetter(false);
                  }}
                  className="text-neutral80 bg-white p-2.5 w-full rounded-sm mt-2"
                >
                  BATAL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingSignatureAndMFA;
