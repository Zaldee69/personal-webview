import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EyeIcon from "./../../public/icons/EyeIcon";
import EyeIconOff from "./../../public/icons/EyeIconOff";
import { toast } from "react-toastify";
import XIcon from "../../public/icons/XIcon";
import { useRouter } from "next/router";

type Props = {};

type Tform = {
  tilaka_name: string;
  password: string;
};

const LinkAccount = (props: Props) => {
  const router = useRouter();
  const routerQuery = router.query;
  const [showPassword, showPasswordSetter] = useState<boolean>(false);
  const [nikRegistered, nikRegisteredSetter] = useState<boolean>(true);
  const [isProcessing, isProcessingSetter] = useState<boolean>(false);
  const [form, formSetter] = useState<Tform>({ tilaka_name: "", password: "" });

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    formSetter({ ...form, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    isProcessingSetter(true);

    const target = e.target as typeof e.target & {
      tilaka_name: { value: Tform["tilaka_name"] };
      password: { value: Tform["password"] };
    };

    const tilaka_name = target.tilaka_name.value;
    const password = target.password.value;

    console.log(tilaka_name);
    console.log(password);

    const data = {
      tilaka_name,
      password,
    };

    console.log(data);

    setTimeout(() => {
      if (tilaka_name === "success") {
        router.replace({
          pathname: "/link-account/success",
          query: { ...routerQuery },
        });
      } else if (tilaka_name === "failure") {
        router.replace("/link-account/failure");
      } else {
        toast.error("Tilaka Name / Kata Sandi Salah", {
          icon: <XIcon />,
        });
        isProcessingSetter(false);
      }
    }, 2000);
  };

  useEffect(() => console.log(form), [form]);

  // if (isProcessing) {
  //   return <LinkAccountProcess {...props} />;
  // }

  return (
    <div className="px-5 py-9">
      <p className="font-poppins text-lg font-semibold text-neutral800">
        Penautan Akun
      </p>
      <div className="flex justify-center mt-6">
        <Image src="/images/linkAccount.svg" width="150px" height="150px" />
      </div>
      {nikRegistered && (
        <p className="font-poppins text-sm text-neutral800 mt-5">
          NIK Anda telah terdaftar di Tilaka. Mohon mengisi data-data berikut
          sebagai proses penautan akun Tilaka:
        </p>
      )}
      <form onSubmit={handleFormOnSubmit}>
        <label className="block mt-4">
          <div className="flex justify-start items-center">
            <p className="font-poppins text-sm text-neutral200 pl-2.5">
              Tilaka Name
            </p>
            <div className="tooltip font-poppins">
              <p className="text-white bg-neutral200 w-3 h-3 flex justify-center items-center text-xs rounded-full ml-1">
                ?
              </p>
              <span className="tooltiptext text-xs">
                Tilaka Name tidak dapat diubah dan akan digunakan sebagai
                username untuk pengguna masuk / login ke akun Tilaka.
              </span>
            </div>
          </div>
          <div className="mt-1 relative">
            <input
              type="text"
              name="tilaka_name"
              placeholder="Masukkan Tilaka Name"
              value={form.tilaka_name}
              onChange={handleFormOnChange}
              className="px-2.5 py-3 w-full focus:outline-none text-sm text-neutral800 font-poppins border border-neutral40 rounded-md"
            />
          </div>
        </label>
        <label className="block mt-6">
          <div className="flex justify-start items-center">
            <p className="font-poppins text-sm text-neutral200 pl-2.5">
              Kata Sandi
            </p>
          </div>
          <div className="mt-1 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Masukkan Kata Sandi"
              value={form.password}
              onChange={handleFormOnChange}
              className="px-2.5 py-3 w-full focus:outline-none text-sm text-neutral800 font-poppins border border-neutral40 rounded-md"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                showPasswordSetter(!showPassword);
              }}
              className="absolute right-2.5 top-3 bg-white"
            >
              {showPassword ? <EyeIconOff /> : <EyeIcon />}
            </button>
          </div>
        </label>
        <div className="flex justify-center items-center mt-10">
          <Link href="/forgot-password">
            <a className="font-poppins text-primary text-xs">Lupa Kata Sandi</a>
          </Link>
          <div className="block mx-2.5">
            <Image src="/images/lineVertical.svg" width="8px" height="24px" />
          </div>
          <Link href="/forgot-tilakaname">
            <a className="font-poppins text-primary text-xs">
              Lupa Tilaka Name
            </a>
          </Link>
        </div>
        <button
          type="submit"
          className="mt-16 w-full p-2.5 text-base text-white rounded-sm bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing}
        >
          TAUTKAN AKUN
        </button>
      </form>
      <div className="mt-8 flex justify-center">
        <Image
          src="/images/poweredByTilaka.svg"
          alt="powered-by-tilaka"
          width="80px"
          height="41.27px"
        />
      </div>
    </div>
  );
};

export default LinkAccount;

// const LinkAccountProcess = (props: Props) => {
//   return (
//     <div className="px-10 pt-16 pb-9 text-center">
//       <p className="font-poppins text-base font-semibold text-neutral800">
//         Penautan Akun Berhasil!
//       </p>
//       <div className="mt-20">
//         <Image
//           src="/images/linkAccountSuccess.svg"
//           width="196px"
//           height="196px"
//         />
//       </div>
//       <div className="mt-24">
//         <Image
//           src="/images/loader.svg"
//           width="46.22px"
//           height="48px"
//           className="animate-spin"
//         />
//         <p className="font-poppins text-sm text-neutral50">Mohon menunggu...</p>
//       </div>
//       <div className="mt-11 flex justify-center">
//         <Image
//           src="/images/poweredByTilaka.svg"
//           alt="powered-by-tilaka"
//           width="80px"
//           height="41.27px"
//         />
//       </div>
//     </div>
//   );
// };
