/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1200px',
    },
    extend: {
      colors: {
        paper: {
          DEFAULT: '#fbf9f5',
          raised: '#f5f3ef',
          pressed: '#eae8e4',
        },
        ink: {
          DEFAULT: '#1b1c1a',
          muted: '#4c4640',
          faint: '#7d766f',
        },
        line: {
          DEFAULT: '#cec5bd',
        },
        accent: {
          DEFAULT: '#904d17',
          ink: '#ffffff',
        },
        good: {
          DEFAULT: '#4a7556',
        },
        warning: {
          DEFAULT: '#8c6313',
        },
        critical: {
          DEFAULT: '#ba1a1a',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'headline-xl': ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "400" }],
        'headline-lg': ["36px", { lineHeight: "44px", letterSpacing: "-0.015em", fontWeight: "400" }],
        'headline-md': ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "400" }],
        'body-lg': ["18px", { lineHeight: "28px", fontWeight: "400" }],
        'body-md': ["15px", { lineHeight: "24px", fontWeight: "400" }],
        'body-sm': ["13px", { lineHeight: "20px", fontWeight: "400" }],
        'label-md': ["12px", { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "500" }],
        'label-sm': ["11px", { lineHeight: "14px", letterSpacing: "0.08em", fontWeight: "500" }],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.75rem',
        'space-xl': '3rem',
        'gutter': '1.5rem',
        'gutter-desktop': '2.5rem',
        'margin': '1.5rem',
        'margin-desktop': '4rem',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '360ms',
        reveal: '500ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        DEFAULT: '0.25rem', // sharp structural surfaces
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        pill: '9999px', // for badges if needed, though we avoid large radii
      }
    },
  },
  plugins: [],
};
