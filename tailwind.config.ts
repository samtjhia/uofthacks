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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // New Theme Palette
        clay: {
            50: '#F9F8F6',
            100: '#F2F0E9',
            200: '#E6E2D6',
            300: '#D1CCC0',
            400: '#A8A49C',
            500: '#8A8680',
            600: '#6E6A64',
            700: '#52504C',
            800: '#363533',
            900: '#1C1C1E', // Obsidian
        },
        crimson: {
            DEFAULT: '#EB3434', // Nothing Red
            500: '#EB3434',
            600: '#C92626',
        },
        azure: {
            DEFAULT: '#B4C5E4',
            500: '#B4C5E4',
            100: '#EBF1FF',
        },
        glass: {
            border: 'rgba(255, 255, 255, 0.4)',
            surface: 'rgba(255, 255, 255, 0.45)',
            highlight: 'rgba(255, 255, 255, 0.8)',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        'dock': '2.5rem',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
