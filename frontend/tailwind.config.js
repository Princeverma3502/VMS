/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nss-blue': '#1d4ed8',
        nss: {
          blue: '#0056D2',
          dark: '#003c94',
          light: '#e6f0ff'
        },
        growth: {
          green: '#2E7D32',
          light: '#e8f5e9'
        },
        gamification: {
          gold: '#FFD700',
          accent: '#FFF8E1'
        },
        collab: {
          purple: '#6200EA',
          light: '#F3E5F5'
        },
        slate: {
            850: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 6px 18px rgba(13, 42, 148, 0.12)'
      },
      keyframes: {
        'pulse-fast': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.995)', opacity: '0.95' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'flip-card': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        }
      },
      animation: {
        'pulse-fast': 'pulse-fast 180ms ease-in-out',
        'flip-card': 'flip-card 400ms ease-in-out'
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}