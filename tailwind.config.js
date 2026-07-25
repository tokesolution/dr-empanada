/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          400: '#FFB133',
          500: '#FF9900',
          600: '#e68a00',
          900: '#331f00',
        },
        cream: '#FFF8EE',
      },
    },
  },
  plugins: [],
}
