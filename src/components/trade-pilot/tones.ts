/** Design-system tone → Tailwind class maps, shared by chips/cards/banners. */

export type Tone =
  | 'neutral'
  | 'brand'
  | 'navy'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'violet';

/** Tinted chip surface (icon chips, soft fills). */
export const toneChip: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  brand: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
  navy: 'bg-navy-800 text-white',
  success: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  accent: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
};

/** Solid dot / rail colour. */
export const toneDot: Record<Tone, string> = {
  neutral: 'bg-gray-400',
  brand: 'bg-teal-500',
  navy: 'bg-navy-800',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  accent: 'bg-orange-500',
  violet: 'bg-violet-500',
};

/** Ideal-timeframe labels for a job's `urgency` value (rough expectation, not an exact date). */
const URGENCY_LABELS: Record<string, string> = {
  within_1_week: 'Within 1 week',
  within_2_weeks: 'Within 2 weeks',
  within_1_month: 'Within 1 month',
  within_2_months: 'Within 2 months',
  flexible: '3+ months / Flexible',
};

/** Badge tone name for a job urgency/timeframe value (design mapping). */
export function urgencyBadgeTone(
  urgency: string | undefined
): 'danger' | 'accent' | 'info' | 'neutral' {
  switch ((urgency || '').toLowerCase()) {
    case 'within_1_week':
      return 'danger';
    case 'within_2_weeks':
      return 'accent';
    case 'within_1_month':
    case 'within_2_months':
      return 'info';
    default:
      return 'neutral';
  }
}

export function urgencyLabel(urgency: string | undefined): string {
  const u = (urgency || '').toLowerCase();
  if (!u) return 'Flexible';
  return URGENCY_LABELS[u] ?? u.charAt(0).toUpperCase() + u.slice(1);
}
