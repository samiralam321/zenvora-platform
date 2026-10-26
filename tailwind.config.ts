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
        brand: {
          DEFAULT: "#1D64EC",
          hover: "#1554C8",
          light: "#E8F0FE",
          soft: "#EEF4FF",
        },
        navy: {
          DEFAULT: "#0B1B3D",
          dark: "#08142E",
          card: "#0B1E48",
        },
        // Admin & compatibility mappings (Light Mode SaaS palette)
        gold: {
          DEFAULT: "#1D64EC",
          light: "#EEF4FF",
          glow: "#1D64EC",
        },
        ivory: "#0F172A",
        ink: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          sidebar: "#FFFFFF",
        },
        muted: "#64748B",
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
