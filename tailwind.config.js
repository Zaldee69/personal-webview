module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
    colors: {
      primary: "#0052CC",
      white: "#fff",
      neutral: "rgba(107, 119, 140, 1)",
      borderColor: "rgba(223, 225, 230, 1)",
      label: "rgba(107, 119, 140, 1)",
      placeholder: "rgba(193, 199, 208, 1)",
      error: "rgba(255, 86, 48, 1)",
      black : "#000"
    },
  },
  plugins: [],
};

