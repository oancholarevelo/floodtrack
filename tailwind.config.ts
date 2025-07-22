import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: colors.cyan,
        teal: colors.teal,
      },
      boxShadow: {
        't-lg': '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      // Add these new sections for the SOS pulse animation
      animation: {
        'pulse-slow': 'pulse-border 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-border': {
            '0%, 100%': { 'box-shadow': '0 0 0 0 rgba(239, 68, 68, 0.6)' },
            '50%': { 'box-shadow': '0 0 0 5px rgba(239, 68, 68, 0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;