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
          DEFAULT: '#00AEEF', // Keep original fallback
          dark: '#0095CC',
        },
        airline: '#0ea5e9',
        sunset: '#f43f5e',
        sunrise: '#f97316'
      },
      keyframes: {
        highlight: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '10%, 80%': { backgroundColor: '#FEF08A' },
        },
        clouds: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        pack: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' }
        }
      },
      animation: {
        highlight: 'highlight 4s ease-in-out',
        clouds: 'clouds 20s ease infinite',
        pack: 'pack 0.5s ease-in forwards'
      }
    },
  },
  plugins: [],
};
export default config;
