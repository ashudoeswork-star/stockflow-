import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#15161A",
          900: "#1C1E24",
          800: "#262931",
          700: "#363A45",
          600: "#4B505E",
          500: "#646A7A",
          400: "#8B8FA0",
          300: "#B4B7C4",
          200: "#DADCE3",
          100: "#EFF0F3",
          50: "#F7F7F9",
        },
        signal: {
          600: "#C2540C",
          500: "#E06A1A",
          400: "#F08A3C",
          100: "#FCE5D2",
          50: "#FDF2E8",
        },
        ledger: {
          paper: "#FAF8F3",
          line: "#E4E0D4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
