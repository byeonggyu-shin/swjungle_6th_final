/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./src/styles/dashboard.css"],
  theme: {
    fontFamily: {
      sans: ["var(--font-inter)"],
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        NodeColor1: "#5470C6",
        NodeColor2: "#91CC75",
        NodeColor3: "#FAC858",
        NodeColor4: "#EE6666",
        NodeColor5: "#73C0DE",
        NodeColor6: "#3BA272",
        NodeColor7: "#FC8452",
        NodeColor8: "#9A60B4",
        NodeColor9: "#EA7CCC",
        colorRed: "#EE6565",
        colorOrange: "#FB8351",
        colorYellow: "#FAC858",
        colorLightgreen: "#91CB75",
        colorGreen: "#3AA272",
        colorSkyblue: "#73C0DE",
        colorBlue: "#5470C6",
        colorPurple: "#9A60B4",
        colorPink: "#FFC0CB",
      },
    },
  },
  plugins: [],
};
