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
  neutral: 'bg-gray-100 text-gray-600',
  brand: 'bg-teal-50 text-teal-600',
  navy: 'bg-navy-800 text-white',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
  accent: 'bg-orange-50 text-orange-600',
  violet: 'bg-violet-50 text-violet-600',
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

/** Badge tone name for a job urgency value (design urgency mapping). */
export function urgencyBadgeTone(
  urgency: string | undefined
): 'danger' | 'accent' | 'info' | 'neutral' {
  switch ((urgency || '').toLowerCase()) {
    case 'emergency':
      return 'danger';
    case 'urgent':
      return 'accent';
    case 'normal':
      return 'info';
    default:
      return 'neutral';
  }
}

export function urgencyLabel(urgency: string | undefined): string {
  const u = (urgency || '').toLowerCase();
  if (!u) return 'Flexible';
  return u.charAt(0).toUpperCase() + u.slice(1);
}
