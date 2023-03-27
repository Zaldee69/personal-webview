export const getEncodedCurrentUrl = (): string => {
  return encodeURIComponent(window.location.href);
};
