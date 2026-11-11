/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
        },
        ink: { 900: '#0b1020', 800: '#131a30', 700: '#1e2745' }
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px -12px rgba(16,24,40,.18)',
        pop: '0 12px 40px -12px rgba(79,70,229,.35)',
        glow: '0 0 0 1px rgba(99,102,241,.25), 0 8px 30px -8px rgba(99,102,241,.5)'
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        popIn: { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        floatSlow: { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-18px) scale(1.04)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } }
      },
      animation: {
        fadeUp: 'fadeUp .6s cubic-bezier(.16,1,.3,1) both',
        fadeIn: 'fadeIn .45s ease both',
        pop: 'popIn .35s cubic-bezier(.16,1,.3,1) both'
      }
    }
  },
  plugins: []
};
