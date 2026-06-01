/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b6d8ff',
          300: '#87beff',
          400: '#55a0ff',
          500: '#2c80ff',
          600: '#145fe6',
          700: '#124cb8',
          800: '#143f92',
          900: '#173a77',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(44, 128, 255, 0.15), 0 20px 50px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};