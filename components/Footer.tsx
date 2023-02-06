import Image from "next/image";
import { assetPrefix } from "../next.config"

const Footer = () => {
  return (
    <div className="flex absolute right-0 left-0 justify-center">
      <Image src={`${assetPrefix}/images/tilaka-logo.svg`} alt="tilaka-logo" width={100} height={100} />
    </div>
  );
};

export default Footer;
