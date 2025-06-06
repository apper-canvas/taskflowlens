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
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5'
        },
        secondary: {
          DEFAULT: '#64748b',
          light: '#94a3b8',
          dark: '#475569'
        },
        accent: '#f59e0b',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'neu-light': '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
        'neu-dark': '9px 9px 16px rgba(0, 0, 0, 0.25), -9px -9px 16px rgba(40, 40, 40, 0.8)'
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      }
    },
  },
  plugins: [],
}