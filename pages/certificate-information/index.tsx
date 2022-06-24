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

function CertificateInformation({}: Props) {
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
      <div className="flex justify-center">
        <img src="/images/certInfo.svg" alt="ill" />
      </div>
      <p className="text-sm text-neutral800">
        Informasi data pada sertifika Anda
      </p>
      <div className="mt-5">
        <div className="flex items-center">
          <p className="text-sm text-neutral800 font-normal w-24 pr-2">
            Negara
          </p>
          <p className="text-sm text-neutral800 font-medium">ID</p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-neutral800 font-normal w-24 pr-2">Nama</p>
          <p className="text-sm text-neutral800 font-medium">Yeshica</p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-neutral800 font-normal w-24 pr-2">
            Organisasi
          </p>
          <p className="text-sm text-neutral800 font-medium">
            PT Indonesia Jaya Sentosa
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-neutral800 font-normal w-24 pr-2">Email</p>
          <p className="text-sm text-neutral800 font-medium">
            yeshica@gmail.com
          </p>
        </div>
      </div>
      <p className="text-xs text-neutral800 mt-4 font-normal text-justify">
        Apabila dalam jangka waktu{" "}
        <span className="font-semibold">
          sembilan hari kalender tidak ada keluhan
        </span>{" "}
        maka pelanggan dianggap telah menerima bahwa semua informasi yang
        terdapat dalam sertifikat adalah benar.
      </p>
      <button className="mt-8 p-2.5 text-base text-white bg-primary w-full font-medium rounded-sm">
        SESUAI
      </button>
      <button className="mt-4 p-2.5 text-base text-primary bg-white w-full font-medium rounded-sm border border-primary">
        AJUKAN KOMPLAIN
      </button>
      <div className="mt-8 flex justify-center">
        <img src="/images/poweredByTilaka.svg" alt="powered-by-tilaka" />
      </div>
    </div>
  );
}

export default CertificateInformation;
