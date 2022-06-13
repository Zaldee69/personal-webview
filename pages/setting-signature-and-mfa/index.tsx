import { useEffect, useState } from "react";
import SignaturePad from "../../components/SignaturePad";
import InfoIcon from "../../public/icons/InfoIcon";

type Props = {};

type Tform = {
  signature_type: "signature_type_goresan" | "signature_type_font";
  signature_font_type?:
    | "signature_font_type_allan"
    | "signature_font_type_aguafinaScript"
    | "signature_font_type_architectsDaughter"
    | "signature_font_type_giveYouGlory"
    | "signature_font_type_berkshireSwash"
    | "signature_font_type_missFajardose";
  mfa_method:
    | "mfa_method_fr"
    | "mfa_method_otp_email"
    | "mfa_method_otp_ponsel";
};

function SettingSignatureAndMFA({}: Props) {
  const [form, formSetter] = useState<Tform>({
    signature_type: "signature_type_font",
    signature_font_type: "signature_font_type_allan",
    mfa_method: "mfa_method_fr",
  });
  const [showModalOtpPonsel, showModalOtpPonselSetter] =
    useState<boolean>(false);
  const [agreeOtpPonsel, agreeOtpPonselSetter] = useState<boolean>(false);

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      signature_type: { value: Tform["signature_type"] };
      signature_font_type: { value: Tform["signature_font_type"] };
      mfa_method: { value: Tform["mfa_method"] };
    };

    const signature_type = target.signature_type.value;
    const signature_font_type = target.signature_font_type.value;
    const mfa_method = target.mfa_method.value;

    console.log(signature_type);
    console.log(signature_font_type);
    console.log(mfa_method);

    const data = {
      signature_type,
      signature_font_type,
      mfa_method,
    };

    if (signature_type === "signature_type_goresan") {
      data["signature_font_type"] = undefined;
    }

    console.log(data);
    alert(JSON.stringify(data, null, 4));
  };

  useEffect(() => console.log(form), [form]);

  return (
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
            Tanda tangan yang dipilih akan digunakan di dalam dokumen yang Anda
            tandatangani.
          </p>
        </div>
        <div className="mt-5">
          <label className="flex items-center">
            <input
              name="signature_type"
              value="signature_type_goresan"
              onChange={handleFormOnChange}
              checked={form.signature_type === "signature_type_goresan"}
              type="radio"
              className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
            />
            <p className="text-md ml-2.5 text-_030326">Tanda tangan goresan</p>
          </label>
          <label className="flex items-center mt-3.5">
            <input
              name="signature_type"
              value="signature_type_font"
              onChange={handleFormOnChange}
              checked={form.signature_type === "signature_type_font"}
              type="radio"
              className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
            />
            <p className="text-md ml-2.5 text-_030326">Tanda tangan font</p>
          </label>
        </div>
        <div
          className={
            form.signature_type === "signature_type_goresan"
              ? undefined
              : "hidden"
          }
        >
          <SignaturePad />
        </div>
        <div
          className={
            form.signature_type === "signature_type_font" ? undefined : "hidden"
          }
        >
          <div className="grid grid-cols-2 gap-3 mt-5">
            <label className="relative flex items-center">
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
              <p className="text-2xl font-allan text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
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
              <p className="text-2xl font-aguafinaScript text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
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
              <p className="text-lg font-architectsDaughter text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
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
              <p className="text-base font-giveYouGlory text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
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
              <p className="text-2xl font-berkshireSwash text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
            <label className="relative flex items-center">
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
              <p className="text-2xl font-missFajardose text-_030326 absolute w-full text-center">
                Yeshica
              </p>
            </label>
          </div>
        </div>
        <p className="text-md text-neutral800 mt-8">Pilih tipe tanda tangan</p>
        <div className="mt-1.5 rounded-md bg-blue50 py-2 px-4 flex items-start">
          <div className="pt-1">
            <InfoIcon />
          </div>
          <p className="text-xs text-blue500 ml-4">
            Untuk meningkatkan keamanan, diperlukan Multi Factor Authentication
            yang harus Anda gunakan saat melakukan aktivitas tandatangan digital
            ataupun aktivitas lainnya di tilaka.id. Silakan pilih metode MFA
            yang sesuai dengan kenyamanan Anda.
          </p>
        </div>
        <div className="mt-6">
          <label className="flex items-center">
            <input
              name="mfa_method"
              value="mfa_method_fr"
              onChange={handleFormOnChange}
              checked={form.mfa_method === "mfa_method_fr"}
              type="radio"
              className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
            />
            <p className="text-md ml-2.5 text-_030326">Face Recognition</p>
          </label>
          <label className="flex items-center mt-3.5">
            <input
              name="mfa_method"
              value="mfa_method_otp_email"
              onChange={handleFormOnChange}
              checked={form.mfa_method === "mfa_method_otp_email"}
              type="radio"
              className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
            />
            <p className="text-md ml-2.5 text-_030326">OTP via Email</p>
          </label>
          <label className="flex items-center mt-3.5">
            <input
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
              checked={form.mfa_method === "mfa_method_otp_ponsel"}
              type="radio"
              className="appearance-none bg-white w-4 h-4 ring-1 ring-neutral40 border-2 border-white border-neutral40 rounded-full checked:bg-primary checked:ring-primary"
            />
            <p className="text-md ml-2.5 text-_030326">OTP via Ponsel</p>
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
                  formSetter({ ...form, mfa_method: "mfa_method_otp_ponsel" });
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
  );
}

export default SettingSignatureAndMFA;
