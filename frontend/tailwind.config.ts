import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffbeb",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          500: "#FFCD00",
          600: "#FFCD00",
          700: "#E6B800",
          800: "#000000",
        },
        rapido: {
          yellow: "#FFCD00",
          black: "#000000",
          navy: "#1D4ED8",
          green: "#16A34A",
          tint: "#EBF5FB",
          map: "#E8E6E1",
          grey: "#6B7280",
          disabled: "#CBD5E1",
        },
        ink: {
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#000000",
        },
        surface: {
          50: "#FAFAFA",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
        },
        success: {
          50: "#F0FDF4",
          700: "#16A34A",
        },
        warning: {
          50: "#FFFBEB",
          800: "#92400E",
        },
        danger: {
          50: "#FEF2F2",
          700: "#DC2626",
        },
      },
      boxShadow: {
        card: "0 1px 4px 0 rgb(0 0 0 / 0.08)",
        sheet: "0 -4px 24px rgb(0 0 0 / 0.14)",
        float: "0 2px 8px rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
