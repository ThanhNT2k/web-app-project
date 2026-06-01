/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          50: '#eefbf7',
          100: '#d4f5e9',
          200: '#abead4',
          300: '#77dbb8',
          400: '#43c598',
          500: '#24a779',
          600: '#1d855f',
          700: '#17684c',
          800: '#14543e',
          900: '#114437'
        }
      },
      boxShadow: {
        glow: '0 20px 60px rgba(36, 167, 121, 0.18)'
      }
    }
  },
  plugins: []
};