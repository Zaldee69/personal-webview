import React, { useState } from "react";
import Footer from "../../components/Footer";
import EyeIcon from "./../../public/icons/EyeIcon";
import EyeIconOff from "./../../public/icons/EyeIconOff";

const Login = () => {
  const [type, setType] = useState<{ password: string }>({
    password: "password",
  });

  const handleShowPwd = (
    types: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setType((prev) => ({
      ...prev,
      password: type.password === "password" ? "text" : "password",
    }));
  };
  return (
    <div className="px-5 pt-8 sm:w-full md:w-4/5 mx-auto">
      <div className="flex flex-col gap-5 mt-10 items-center">
        <div className="py-3 px-5 font-semibold text-xl inline-block  text-white bg-[#64bac3] rounded-full">
          Y
        </div>
        <span className="font-bold text-xl text-[#172b4d] font-poppins">
          Hai, booh21
        </span>
      </div>
      <div className="flex flex-col  mt-20">
        <label
          className="font-poppins px-2 text-label font-light"
          htmlFor="password"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <input
            //   onChange={(e) => onChangeHandler(e)}
            name="password"
            type={type.password}
            placeholder="Masukkkan Kata Sandi"
            className={`font-poppins py-3 focus:outline-none border-borderColor focus:ring  placeholder:text-placeholder placeholder:font-light  px-2 rounded-md border  w-full`}
          />
          <button
            onClick={(e) => handleShowPwd("password", e)}
            className="absolute right-3 top-3"
          >
            {type.password === "password" ? <EyeIcon /> : <EyeIconOff />}
          </button>
        </div>
        <a className="m-5 text-center font-poppins text-primary" href="#">
          Lupa kata sandi
        </a>
      </div>
      <button className="bg-primary mt-32 text-xl md:mx-auto md:block md:w-1/4 text-white font-poppins w-full mx-auto rounded-sm h-11">
        MASUK
      </button>
      <Footer />
    </div>
  );
};

export default Login;
