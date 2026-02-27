import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1117",
        },
        indigo: {
          DEFAULT: "#6366F1",
        },
        emerald: {
          DEFAULT: "#10B981",
        },
      },
    },
  },
  plugins: [],
};

export default config;

