import { useState } from "react";
import Image from "next/image";
import EyeIcon from "./../../public/icons/EyeIcon";
import EyeIconOff from "./../../public/icons/EyeIconOff";
import { useRouter } from "next/router";
import Head from "next/head";
import { assetPrefix } from "../../next.config";
import { RestPersonalResetPassword } from "infrastructure/rest/personal";
import { toast } from "react-toastify";
import XIcon from "@/public/icons/XIcon";
import CheckOvalIcon from "@/public/icons/CheckOvalIcon";
import Button from "@/components/atoms/Button";
import Footer from "@/components/Footer";
import { themeConfigurationAvaliabilityChecker } from "@/utils/themeConfigurationChecker";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

type Props = {};

type Tform = {
  password: string;
  confirm_password: string;
};

type TformErrors = {
  password: string;
  confirm_password: string;
};

const LinkAccount = (props: Props) => {
  const router = useRouter();
  const [showPassword, showPasswordSetter] = useState<boolean>(false);
  const [showConfirmPassword, showConfirmPasswordSetter] =
    useState<boolean>(false);
  const [form, formSetter] = useState<Tform>({
    password: "",
    confirm_password: "",
  });
  const [formErrors, formErrorsSetter] = useState<TformErrors>({
    password: "",
    confirm_password: "",
  });

  const themeConfiguration = useSelector((state: RootState) => state.theme);

  const { kunciRahasia: key, ...routerQuery } = router.query;
  const keyExist: boolean = key ? true : false;
  const submitShouldDisabled: boolean =
    !keyExist ||
    !form.password ||
    !form.confirm_password ||
    !!formErrors.password ||
    !!formErrors.confirm_password;

  const handleFormOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
    const { name, value } = e.currentTarget;

    formSetter((prev) => ({ ...prev, [name]: value }));

    formErrorsSetter((prev) => {
      const stateObj = { ...prev, [name]: "" };

      switch (name) {
        case "password":
          if (!value) {
            stateObj[name] = "Bidang ini harus diisi";
          } else if (
            !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])[0-9a-zA-Z@#$%^&+=]{10,40}$/.test(
              value
            )
          ) {
            stateObj[name] =
              "Bidang ini harus berisi minimal 10 karakter dan maksimal 40 karakter termasuk satu angka, huruf kecil, huruf besar, dan karakter khusus: @#$%^&+=";
          } else if (form.password && value !== form.confirm_password) {
            stateObj["confirm_password"] = "Kata sandi tidak sama";
          } else {
            stateObj["confirm_password"] = form.confirm_password
              ? ""
              : formErrors.confirm_password;
          }
          break;

        case "confirm_password":
          if (!value) {
            stateObj[name] = "Bidang ini harus diisi";
          } else if (
            !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])[0-9a-zA-Z@#$%^&+=]{10,40}$/
          ) {
            stateObj[name] =
              "Bidang ini harus berisi minimal 10 karakter dan maksimal 40 karakter termasuk satu angka, huruf kecil, huruf besar, dan karakter khusus: @#$%^&+=";
          } else if (form.password && value !== form.password) {
            stateObj[name] = "Kata sandi tidak sama";
          }
          break;

        default:
          break;
      }

      return stateObj;
    });
  };

  const handleFormOnSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      password: { value: Tform["password"] };
      confirm_password: { value: Tform["confirm_password"] };
    };

    const password = target.password.value;

    RestPersonalResetPassword({ payload: { password, token: key as string } })
      .then((res) => {
        if (res.success) {
          toast.success("Berhasil mengganti kata sandi!", {
            icon: <CheckOvalIcon />,
          });
          router.replace({
            pathname: router.pathname + "/success",
            query: { kunciRahasia: key, ...routerQuery },
          });
        } else {
          toast.error(res.message || "Gagal request reset password", {
            icon: <XIcon />,
          });
        }
      })
      .catch((err) => {
        if (
          err.response?.data?.message &&
          err.response?.data?.data?.errors?.[0]
        ) {
          toast.error(
            `${err.response?.data?.message}, ${err.response?.data?.data?.errors?.[0]}`,
            {
              icon: <XIcon />,
            }
          );
        } else {
          toast.error(
            err.response?.data?.message ||
              "Kesalahan pada saat request reset password",
            {
              icon: <XIcon />,
            }
          );
        }
      });
  };

  return (
    <div style={{
      backgroundColor: themeConfigurationAvaliabilityChecker(
        themeConfiguration?.data.background as string, "BG"
      ),
    }} >
      <Head>
        <title>Pengaturan Ulang Kata Sandi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 py-9 max-w-md mx-auto min-h-screen flex flex-col justify-between">
        <div>
          <p className="font-poppins text-lg font-normal text-neutral800 text-center">
            Pengaturan Ulang Kata Sandi
          </p>
          <form onSubmit={handleFormOnSubmit}>
            <label className="block mt-11">
              <div className="flex justify-start items-center">
                <p className="font-poppins text-sm text-neutral200 pl-2.5">
                  Kata Sandi Baru
                </p>
              </div>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan Kata Sandi Baru"
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
                <p className="text-error font-poppins pl-2 pt-1.5 block text-xs">
                  {formErrors.password}
                </p>
              </div>
            </label>
            <label className="block mt-6">
              <div className="flex justify-start items-center">
                <p className="font-poppins text-sm text-neutral200 pl-2.5">
                  Konfirmasi Kata Sandi Baru
                </p>
              </div>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Masukkan Konfirmasi Kata Sandi Baru"
                  value={form.confirm_password}
                  onChange={handleFormOnChange}
                  className="px-2.5 py-3 w-full focus:outline-none text-sm text-neutral800 font-poppins border border-neutral40 rounded-md"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    showConfirmPasswordSetter(!showConfirmPassword);
                  }}
                  className="absolute right-2.5 top-3 bg-white"
                >
                  {showConfirmPassword ? <EyeIconOff /> : <EyeIcon />}
                </button>
                <p className="text-error font-poppins pl-2 pt-1.5 block text-xs">
                  {formErrors.confirm_password}
                </p>
              </div>
            </label>
            <Button
              type="submit"
              size="full"
              disabled={submitShouldDisabled}
              className="mt-7 p-2.5 text-base"
              style={{
                backgroundColor: themeConfigurationAvaliabilityChecker(
                  themeConfiguration?.data.buttonColor as string
                ),
              }}
            >
              BUAT KATA SANDI BARU
            </Button>
          </form>
        </div>
        <Footer/>
      </div>
    </div>
  );
};

export default LinkAccount;
