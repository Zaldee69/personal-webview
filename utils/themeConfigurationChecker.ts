export const themeConfigurationAvaliabilityChecker = (
  str: string,
  identifier?: "BG" | "ASSET" | undefined,
  alt?: string,
): string => {
  if (identifier === "ASSET" && !str) {
    return alt as string;
  } else if (!str && identifier === "BG") {
    return "#fff";
  } else if (!str && !identifier) {
    return "#0052CC";
  } else if (identifier === "ASSET" && str) {
    return "data:image/png;base64,".concat(str);
  } else {
    return str;
  }
};
