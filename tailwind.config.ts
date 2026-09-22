import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        cream: "#f4f1ea",
        night: "#0c0e12",
        tech: "#0f6e56",
        "tech-deep": "#143f36",
        home: "#e25b32",
        "home-deep": "#9a3412",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 50px rgba(23, 25, 30, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
