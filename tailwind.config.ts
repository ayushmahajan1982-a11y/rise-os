import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000000",
      white: "#FFFFFF",
      red: "#FF0000",
      background: "#000000",
      foreground: "#FFFFFF",
      border: "#FFFFFF",
      accent: "#FF0000",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Arial", "Helvetica", "sans-serif"],
        dot: ["var(--font-dot)", "Courier New", "monospace"],
      },
      borderWidth: {
        DEFAULT: "1px",
      },
      borderRadius: {
        none: "0",
        pill: "9999px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
