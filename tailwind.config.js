/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        card: '#131a2e',
        border: 'rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 16s linear infinite',
      },
    },
  },
  plugins: [],
}
