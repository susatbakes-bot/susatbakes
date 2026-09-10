/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sweet-blush': '#FDECEF',
        'frosted-cupcake': '#FFF5F7',
        'dark-fudge': '#1F110B',
        'bubblegum-berry': '#E87A90',
        'bubblegum-hover': '#D9687E',
        'muted-rose': '#C86D7C',
        'cocoa-tint': '#E2CED2',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      boxShadow: {
        'baked': '0 8px 30px rgba(232, 122, 144, 0.12)',
        'baked-hover': '0 12px 35px rgba(200, 109, 124, 0.2)',
      }
    },
  },
  plugins: [],
}
