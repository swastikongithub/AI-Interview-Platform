export const themeClasses = {
  // Cards & Panels (Large 16-24px border-radius, dark surface on light shell)
  card: 'bg-surface text-white border border-border rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-accent/40',
  cardStatic: 'bg-surface text-white border border-border rounded-3xl p-6 md:p-8 shadow-xl',
  cardElevated: 'bg-surface-elevated text-white border border-border rounded-3xl p-6 md:p-8 shadow-2xl',

  // Pill-shaped Buttons (Fully rounded pill shape)
  buttonPrimary:
    'inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-surface-elevated text-white font-semibold text-sm border border-border transition-all duration-200 hover:bg-surface hover:border-accent/60 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-focus shadow-lg',
  buttonAccent:
    'inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-accent text-white font-semibold text-sm transition-all duration-200 hover:bg-accent-hover hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-focus shadow-lg',
  buttonSecondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface-elevated text-white text-xs font-semibold border border-border hover:border-accent/50 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-focus',

  // Stat / Tag Chips (Pill-shaped chips)
  chip: 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-white text-xs font-semibold shadow-sm',
  chipAccent:
    'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold shadow-sm',

  // Typography Hierarchy
  eyebrow:
    'inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-elevated border border-border text-accent text-xs font-bold uppercase tracking-wider',
  headlineLarge:
    'text-3xl md:text-5xl font-extrabold tracking-tight text-white',
  subhead: 'text-sm text-text-muted',
  subheadWhite: 'text-sm text-slate-300',

  // Icon Badges (Rounded-square badges with soft inset treatment)
  iconBadge:
    'w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner',
  iconBadgeSmall:
    'w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner',

  // Forms & Inputs
  input:
    'w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted',

  // Empty State Container
  emptyState:
    'border border-dashed border-border rounded-3xl p-10 md:p-12 text-center space-y-4 bg-surface/40',
};
