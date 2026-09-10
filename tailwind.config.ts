import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FDF0F5',
        brown: {
          DEFAULT: '#4A2C2A',
          light: '#7A4C4A',
          dark: '#2E1A18',
          subtle: '#9E7472',
        },
        pink: {
          brand: '#E6007E',
          light: '#FF4DB2',
          pale: '#FDF0F5',
          soft: '#FCE4EC',
        },
        cream: '#FFF5F9',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
