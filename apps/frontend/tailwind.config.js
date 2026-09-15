/** @type {import('tailwindcss').Config} */

// Every color resolves through a CSS custom property holding RGB channels
// (defined in src/index.css). Surfaces that switch to the dark "night" palette
// (navigation rail, interview session) re-declare the variables under
// `.theme-night`, so every component adapts without per-context variants.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    // Wraps `hover:` in @media (hover: hover) so touch taps never fire hover styles.
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          sunken: token('surface-sunken'),
          hover: token('surface-hover'),
        },
        fg: {
          DEFAULT: token('fg'),
          secondary: token('fg-secondary'),
          muted: token('fg-muted'),
          inverse: token('fg-inverse'),
        },
        edge: {
          DEFAULT: token('edge'),
          strong: token('edge-strong'),
        },
        signal: {
          DEFAULT: token('signal'),
          fg: token('signal-fg'),
          text: token('signal-text'),
          soft: token('signal-soft'),
        },
        positive: { DEFAULT: token('positive'), soft: token('positive-soft') },
        caution: { DEFAULT: token('caution'), soft: token('caution-soft') },
        negative: { DEFAULT: token('negative'), soft: token('negative-soft') },
        info: { DEFAULT: token('info'), soft: token('info-soft') },
        focus: token('focus'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Display — Bricolage Grotesque, tight tracking
        'display-xl': ['clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '600' }],
        'display-lg': ['clamp(2rem, 1.5rem + 2vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md': ['clamp(1.625rem, 1.35rem + 1.1vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' }],
        // Interface titles — Geist
        'title-lg': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.012em', fontWeight: '600' }],
        'title-md': ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.008em', fontWeight: '600' }],
        'title-sm': ['0.9375rem', { lineHeight: '1.375rem', letterSpacing: '-0.004em', fontWeight: '600' }],
        // Body
        'body-lg': ['1.0625rem', { lineHeight: '1.75rem' }],
        body: ['0.9375rem', { lineHeight: '1.5rem' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        // Labels & metadata
        label: ['0.8125rem', { lineHeight: '1rem', fontWeight: '500' }],
        meta: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        micro: ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.04em', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0',
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        hairline: '0 0 0 1px rgb(var(--c-edge))',
        raise: '0 1px 2px rgb(var(--c-shadow) / 0.06), 0 1px 1px rgb(var(--c-shadow) / 0.04)',
        overlay: '0 24px 48px -12px rgb(var(--c-shadow) / 0.28), 0 0 0 1px rgb(var(--c-edge))',
      },
      // Curves and durations come from the Animate skill tables — do not hand-roll new ones.
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        press: '160ms',
        quick: '200ms',
        modal: '250ms',
        drawer: '400ms',
      },
      maxWidth: {
        prose: '68ch',
        page: '1320px',
      },
      zIndex: {
        rail: '30',
        header: '40',
        overlay: '60',
        toast: '80',
      },
    },
  },
  plugins: [],
};
