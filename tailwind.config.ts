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
        primary: {
          DEFAULT: '#00AEEF',
          dark: '#0095CC',
        }
      },
      keyframes: {
        highlight: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '10%, 80%': { backgroundColor: '#FEF08A' },
        }
      },
      animation: {
        highlight: 'highlight 4s ease-in-out',
      }
    },
  },
  plugins: [],
};
export default config;
