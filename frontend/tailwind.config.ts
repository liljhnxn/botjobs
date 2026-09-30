import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bot: {
          bg: "#090B10",
          surface: "#11151F",
          card: "#161B28",
          border: "#232B3E",
          accent: "#10B981",
          accentHover: "#059669",
          cyan: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
