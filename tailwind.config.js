module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily : {
        "poppins" : [ 'Poppins', 'sans-serif']
      }
    },
    colors : {
      primary : "#0052CC",
      white : "#fff",
      neutral : "rgba(107, 119, 140, 1)"
    }
  },
  plugins: [],
}