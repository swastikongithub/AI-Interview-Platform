/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f7f7f5',
        surface: {
          dark: '#0e0e0e',
          elevated: '#18181b',
          light: '#ffffff'
        },
        border: {
          light: '#e5e5e0',
          dark: '#27272a'
        },
        text: {
          primary: '#111111',
          muted: '#555555',
          tertiary: '#6b6b6b',
          inverted: '#f0f0f0',
          'inverted-muted': '#a0a0a0'
        },
        accent: {
          DEFAULT: '#a95a20',
          hover: '#c9702f',
          light: '#df8c51'
        },
        success: '#4a7556',
        warning: '#8c6313',
        danger: '#b04343',
        focus: '#c9702f',
        glass: 'rgba(14, 14, 14, 0.85)',
        overlay: 'rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(201, 112, 47, 0.25)',
      },
      borderRadius: {
        'pill': '9999px',
        'card-lg': '24px',
        'card-md': '16px',
      },
      spacing: {
        'section-lg': '8rem',
        'section-md': '4rem',
        'section-sm': '2rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out (no bounce/spring)
      }
    },
  },
  plugins: [],
};
