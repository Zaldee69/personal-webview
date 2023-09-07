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

  return { generatedUrl };
};

export default useGenerateRedirectUrl;
