/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f1115',
        card: '#14161a',
        foreground: '#ffffff',
        muted: '#9ca3af',
        primary: {
          DEFAULT: '#7C3AED',
          50: '#f6eefc',
          100: '#efe4fb'
        }
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        soft: '0 6px 24px rgba(2,6,23,0.6)',
        glow: '0 4px 30px rgba(124,58,237,0.12)'
      }
    }
  },
  plugins: []
}
