import React, { useState, useEffect } from "react";
import {
  getCertificateList
} from "infrastructure/rest/b2b";
import Footer from "@/components/Footer";
import EyeIcon from "@/public/icons/EyeIcon";
import EyeIconOff from "@/public/icons/EyeIconOff";
import { AppDispatch, RootState } from "@/redux/app/store";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/loginSlice";
import { setAuthToken } from "@/config/API";
import { TLoginProps } from "@/interface/interface";
import Head from "next/head";
import toastCaller from "@/utils/toastCaller";
import { toast } from 'react-toastify'
import { useRouter } from "next/router";
import { handleRoute } from './../../utils/handleRoute';

type Props = {
  channel_id: string;
  pathname: string;
};

const Login = () => {
  const [password, setPassword] = useState<string>("");
  const [tilakaName, setTilakaName] = useState("")
  const [type, setType] = useState<{ password: string }>({
    password: "password",
  });
  const dispatch: AppDispatch = useDispatch();
  const data = useSelector((state: RootState) => state.login);
  const router = useRouter();
  const { channel_id, tilaka_name, company_id } = router.query;
  const { pathname } = router;


  useEffect(() => {
    if (router.isReady) {
      setAuthToken({ channel_id, pathname } as Props);
      setTilakaName(tilaka_name as string)
    }
  }, [router.isReady]);

  useEffect(() => {
    if (data.status === "FULLFILLED" && data.data.success) {
      localStorage.setItem("token", data.data.data as string)
      getCertificateList({ params: company_id as string }).then((res) => {
        const certif = JSON.parse(res.data)
        if (certif[0].status == "Aktif") {
          router.replace({
            pathname: handleRoute("/signing"),
            query: { ...router.query },
          });
        } else {
          router.replace({
            pathname: handleRoute("/certificate-information"),
            query: { ...router.query },
          });
        }
      })
    }
    toastCaller(data);
  }, [data.status]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const submitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      login({ password, ...router.query } as TLoginProps)
    );
    setPassword("");
  };

  const handleShowPwd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setType((prev) => ({
      ...prev,
      password: type.password === "password" ? "text" : "password",
    }));
  };
  return (
    <>
      <Head>
        <title>Tilaka</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="px-5 pt-8 max-w-screen-sm sm:w-full md:w-4/5 mx-auto">
        <div className="flex flex-col gap-5 mt-10 items-center">
          <div className="h-14 w-14 font-semibold flex  text-xl items-center justify-center name text-white bg-[#64bac3] rounded-full">
            {tilakaName[0]?.toUpperCase()}
          </div>
          <span className="font-bold text-xl text-[#172b4d] font-poppins">
            Hai, {tilaka_name}
          </span>
        </div>
        <form onSubmit={submitHandler}>
          <div className="flex flex-col  mt-20">
            <label
              className="font-poppins px-2 text-label font-light"
              htmlFor="password"
            >
              Kata Sandi
            </label>
            <div className="relative flex-1">
              <input
                onChange={(e) => onChangeHandler(e)}
                value={password}
                name="password"
                type={type.password}
                placeholder="Masukkan Kata Sandi"
                className={`font-poppins py-3 focus:outline-none border-borderColor focus:ring  placeholder:text-placeholder placeholder:font-light px-2 rounded-md border w-full`}
              />
              <button
                type="button"
                onClick={(e) => handleShowPwd(e)}
                className="absolute right-3 top-3"
              >
                {type.password === "password" ? <EyeIcon /> : <EyeIconOff />}
              </button>
            </div>
            <a className="m-5 text-center font-poppins text-primary" href="#">
              Lupa Kata Sandi
            </a>
          </div>
          <button
            type="submit"
            disabled={password.length < 1}
            className="bg-primary disabled:opacity-50 mt-32 text-xl md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-11"
          >
            MASUK
          </button>
        </form>
        <Footer />
      </div>
    </>
  );
};

export default Login;
