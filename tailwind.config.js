module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: { "352px": "352px" },
    },
    colors: {
      primary: "#0052CC",
      success: "#1df74c",
      warning: "#f7e81b",
      white: "#fff",
      neutral: "rgba(107, 119, 140, 1)",
      borderColor: "rgba(223, 225, 230, 1)",
      label: "rgba(107, 119, 140, 1)",
      placeholder: "rgba(193, 199, 208, 1)",
      error: "rgba(255, 86, 48, 1)",
      black: "#000",
      neutral10: "#FAFBFC",
      neutral20: "#F4F5F7",
      neutral30: "#EBECF0",
      neutral40: "#DFE1E6",
      neutral50: "#C1C7D0",
      neutral60: "#B3BAC5",
      neutral80: "#97A0AF",
      neutral200: "#6B778C",
      neutral800: "#172B4D",
      blue50: "#DEEBFF",
      blue500: "#0747A6",
      red50: "#FFEBE6",
      red75: "#FFBDAD",
      red300: "#FF5630",
      green50: "#E3FCEF",
      green200: "#57D9A3",
      primary70: "#DAE6F8",
      _B6B6B6: "#B6B6B6",
      _1A73E8: "#1A73E8",
      _030326: "#030326",
      transparent: "transparent",
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // https://github.com/tailwindlabs/tailwindcss-forms#using-only-global-styles-or-only-classes
    }),
  ],
};
