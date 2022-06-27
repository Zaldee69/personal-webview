type Props = {};

function CertificateInformation({}: Props) {
  const handleConfirm = (): void => {
    //
    alert("ok");
  };
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
      <button
        onClick={handleConfirm}
        className="mt-8 p-2.5 text-base text-white bg-primary w-full font-medium rounded-sm"
      >
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
