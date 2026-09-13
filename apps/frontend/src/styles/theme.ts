export const themeClasses = {
  // Cards & Panels (Large 16-24px border-radius, dark surface on light shell)
  card: 'bg-paper text-ink border border-line rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-accent/40',
  cardStatic: 'bg-paper text-ink border border-line rounded-3xl p-6 md:p-8 shadow-sm',
  cardElevated: 'bg-paper-raised text-ink border border-line rounded-3xl p-6 md:p-8 shadow-md',

  // Pill-shaped Buttons (Fully rounded pill shape)
  button: {
    primary:
      'inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-paper-raised text-ink font-semibold text-sm border border-line transition-all duration-200 hover:bg-paper hover:border-accent/60 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent shadow-sm',
    secondary:
      'inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-transparent text-ink font-semibold text-sm border-2 border-line hover:border-accent/50 hover:bg-paper-raised transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent',
    sm:
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-paper-raised text-ink text-xs font-semibold border border-line hover:border-accent/50 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent',
  },

  // Stat / Tag Chips (Pill-shaped chips)
  chip: 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper-raised border border-line text-ink text-xs font-semibold shadow-sm',
  badge: {
    success: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-good/10 text-good text-[10px] font-bold uppercase tracking-wider',
    warning: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider',
    error: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-critical/10 text-critical text-[10px] font-bold uppercase tracking-wider',
    neutral: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-faint/10 text-ink text-[10px] font-bold uppercase tracking-wider',
    accent:
      'inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper-raised border border-line text-accent text-xs font-bold uppercase tracking-wider',
  },

  // Icon Badges (Rounded-square badges with soft inset treatment)
  iconBadge:
    'w-12 h-12 rounded-2xl bg-paper-raised border border-line flex items-center justify-center text-accent shadow-inner',
  iconBadgeSmall:
    'w-9 h-9 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-accent shadow-inner',

  // Typography Hierarchy
  eyebrow:
    'inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-paper-raised border border-line text-accent text-xs font-bold uppercase tracking-wider',
  headlineLarge:
    'text-3xl md:text-5xl font-extrabold tracking-tight text-ink',
  subhead: 'text-sm text-ink-muted',
  subheadWhite: 'text-sm text-slate-300',

  // Forms & Inputs
  input:
    'w-full px-4 py-2.5 rounded-2xl bg-paper-raised border border-line text-ink text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted',

  // Empty State Container
  emptyState:
    'border border-dashed border-line rounded-3xl p-10 md:p-12 text-center space-y-4 bg-paper/40',
};
