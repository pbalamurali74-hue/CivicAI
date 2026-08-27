/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          yellow: '#FFC107',
          'yellow-hover': '#F59E0B',
          red: '#D32F2F',
          'red-hover': '#B71C1C',
          charcoal: '#212121',
          gray: '#F5F5F5',
          border: '#E4E4E7',
          white: '#FFFFFF',
          amber: '#F59E0B',
          rose: '#EF4444',
          card: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}
