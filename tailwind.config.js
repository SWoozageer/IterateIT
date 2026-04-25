/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:           '#0057d9',
          navy:           '#0d1b2a',
          'off-white':    '#f0f4f8',
          steel:          '#8a9bb0',
          'pale-blue':    '#a8c8ff',
          divider:        '#dde3ec',
          'dark-divider': '#1e3050',
          'app-bg':       '#0f1117',
          card:           '#f5f7fa',
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body:    ['Barlow', 'sans-serif'],
      }
    },
  },
  plugins: [],
}