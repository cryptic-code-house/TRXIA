/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080707',
        surface: {
          50: '#1A1716',
          100: '#151211',
          200: '#100D0C',
          300: '#0C0A09',
        },
        brand: {
          orange: '#FF5E0E',
          'orange-bright': '#FF7824',
          'orange-glow': '#FF944D',
          'orange-dark': '#C94300',
        },
      },
      fontFamily: {
        michroma: ['Michroma', 'Arial Black', 'sans-serif'],
        exo: ['"Exo 2"', 'Segoe UI', 'system-ui', 'sans-serif'],
        figtree: ['Figtree', 'Segoe UI', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass-glow': '0 0 50px -10px rgba(255, 94, 14, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'orange-sm': '0 0 15px rgba(255, 94, 14, 0.4)',
        'orange-md': '0 0 30px rgba(255, 94, 14, 0.55)',
        'orange-lg': '0 0 60px rgba(255, 94, 14, 0.65)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at center, rgba(255, 94, 14, 0.25) 0%, rgba(255, 94, 14, 0.05) 45%, rgba(8, 7, 7, 0) 70%)',
        'radial-beam': 'conic-gradient(from 180deg at 50% 50%, rgba(255, 94, 14, 0.2) 0deg, rgba(8, 7, 7, 0) 60deg, rgba(8, 7, 7, 0) 300deg, rgba(255, 94, 14, 0.2) 360deg)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'drift-slow': 'drift 18s ease-in-out infinite alternate',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(30px, -20px) scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};
