/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Adobe-inspired palette
        brand: {
          50: '#EBF3FD',
          100: '#C5DCF9',
          200: '#9EC4F6',
          300: '#78ADF2',
          400: '#4D90EF',
          500: '#1473E6', // Adobe Blue primary
          600: '#0D66D0',
          700: '#0A58B8',
          800: '#084A9E',
          900: '#063D84',
        },
        surface: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EBEBEB',
          300: '#E1E1E1',
          400: '#C7C7C7',
          500: '#ADADAD',
        },
        ink: {
          100: '#6E6E6E',
          200: '#4B4B4B',
          300: '#2C2C2C',
          400: '#1A1A1A',
        },
        sidebar: '#1B1B1B',
        sidebarHover: '#2D2D2D',
        sidebarActive: '#383838',
        deal: {
          green: '#12805C',
          greenBg: '#EBF7F3',
          orange: '#E68619',
          orangeBg: '#FDF4E7',
          red: '#D7373F',
          redBg: '#FCEAEA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.08), 0 0 1px 0 rgba(0,0,0,0.06)',
        cardHover: '0 4px 16px 0 rgba(0,0,0,0.12), 0 0 1px 0 rgba(0,0,0,0.08)',
        panel: '0 2px 8px 0 rgba(0,0,0,0.1)',
      },
      borderRadius: {
        card: '8px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
