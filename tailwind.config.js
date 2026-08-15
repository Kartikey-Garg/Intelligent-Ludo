/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ludo: {
          red: '#ef4444',
          'red-dark': '#991b1b',
          green: '#10b981',
          'green-dark': '#065f46',
          yellow: '#f59e0b',
          'yellow-dark': '#78350f',
          blue: '#3b82f6',
          'blue-dark': '#1e3a8a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 1.5s infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
