import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "tactical-green": {
          DEFAULT: "#39ff14",
          dim: "#1d720b",
        },
        "tactical-amber": {
          DEFAULT: "#ffb000",
        },
        "tactical-red": {
          DEFAULT: "#ff3333",
        },
        "tactical-cyan": {
          DEFAULT: "#0ff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
