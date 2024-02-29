import { concateRedirectUrlParams } from "@/utils/concateRedirectUrlParams";

interface IUseGenerateRedirectParam {
  url: string;
  params?: {};
  type?: string;
}

const useGenerateRedirectUrl = ({
  url,
  params,
  type,
}: IUseGenerateRedirectParam) => {
  const queryString = new URLSearchParams(params as {}).toString();

  const generatedUrl = concateRedirectUrlParams(url, queryString);

  const timeout = Number(process.env.NEXT_PUBLIC_AUTO_REDIRECT_TIMEOUT) * 1000 || 5000;

  const autoRedirect = () => {
    if (url)
      setTimeout(() => {
        window.top!.location.href = generatedUrl;
      }, timeout as number);
  };

  return { generatedUrl, autoRedirect };
};

export default useGenerateRedirectUrl;
