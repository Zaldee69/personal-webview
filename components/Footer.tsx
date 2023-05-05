import Image from "next/image";
import { assetPrefix } from "../next.config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";

const Footer = ({ addMarginBottom }: { addMarginBottom?: boolean }) => {
  const themeConfiguration = useSelector((state: RootState) => state.theme);

  return (
    <footer
      className={`flex justify-center bg-transparent pt-5 ${
        !addMarginBottom && "pb-3"
      }`}
    >
      <div
        className="bg-contain w-20 h-20 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${
            !themeConfiguration?.data.logo
              ? `${assetPrefix}/images/tilaka-logo.svg`
              : `data:image/png;base64,${themeConfiguration?.data.logo}`
          })`,
        }}
      ></div>
    </footer>
  );
};

export default Footer;
