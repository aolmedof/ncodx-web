/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        ncodx: {
          blue: '#2563eb',
          teal: '#0d9488',
          dark: '#0f172a',
          darker: '#020617',
          light: '#f8fafc',
        },
        // Signal Dashboard theme
        signal: {
          green: '#00FF41',
          'green-dim': '#00CC33',
          'green-glow': 'rgba(0,255,65,0.15)',
          bg: '#020408',
          surface: '#060d0f',
          card: '#0a1520',
          border: '#1a2a3a',
          'border-bright': '#2a4a5a',
          text: '#c8d8e8',
          'text-dim': '#7a9ab0',
          'text-muted': '#3a5060',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,255,65,0.3)',
        'glow-green-sm': '0 0 10px rgba(0,255,65,0.2)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'signal-card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,65,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(0,255,65,0.4)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
