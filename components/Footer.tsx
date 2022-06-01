import Image from "next/image";

const Footer = () => {
  return (
    <div className="flex absolute right-0 left-0 justify-center">
      <Image src="/images/tilaka-logo.svg" width={100} height={100} />
    </div>
  );
};

export default Footer;
