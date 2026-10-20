import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "440px",
      },
      colors: {
        bg: "#0A090C",
        paper: "#F4F3EE",
        "paper-deep": "#EAE8E1",
        cream: "#FFFFFF",
        ink: "#0A090C",
        "ink-soft": "#56534E",
        accent: "#E01E1E",
        brand: {
          red: "#E01E1E",
          "red-deep": "#BA1212",
          "red-light": "#FF4444",
          black: "#0A090C",
        },
        red: {
          DEFAULT: "#E01E1E",
          deep: "#BA1212",
          light: "#FF4444",
        },
        orange: {
          DEFAULT: "#D9601E",      // warm accent
          deep: "#B8470F",
          light: "#F29A52",
        },
        gray: {
          white: "#F0F0F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        area: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Sentient", "Georgia", "serif"],
        num: ["var(--font-num)", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
