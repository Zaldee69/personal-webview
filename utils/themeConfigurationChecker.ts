export const themeConfigurationAvaliabilityChecker = (
  str: string,
  identifier?: "BG"
): string => {
  if (!str && identifier) {
    return "#fff";
  } else if (!str && !identifier) {
    return "#0052CC";
  } else {
    return str;
  }
};
