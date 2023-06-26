export const concateRedirectUrlParams = (
  redirectUrl: string,
  searchParams: string
): string => {
  if (!redirectUrl) return "";

  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const query = new URLSearchParams(decodedRedirectUrl.split("?")?.[1]);

  let redirectUrlParamCount = 0;

  for (const [key, value] of query.entries()) {
    redirectUrlParamCount += 1;
  }

  // is redirect_url contain encoded params?
  if (redirectUrlParamCount > 0) {
    return decodeURIComponent(decodedRedirectUrl + "&" + searchParams);
  } else {
    // redirect url with no 3rd Party params
    try {
      return decodeURIComponent(
        redirectUrl.split("?")?.[0] + "?" + searchParams
      );
    } catch (error) {
      return decodeURIComponent(redirectUrl + "?" + searchParams);
    }
  }
};
