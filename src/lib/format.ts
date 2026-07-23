// Currency formatting helpers. Stripe amounts arrive as MINOR units (e.g. pence);
// the transaction ledger stores amounts as MAJOR units (parsed from a decimal string).

const DEFAULT_LOCALE = 'en-GB';
const DEFAULT_CURRENCY = 'gbp';

/** Format a minor-unit amount (Stripe pence) as currency. */
export function formatMoney(
  minorAmount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (currency || DEFAULT_CURRENCY).toUpperCase(),
  }).format((minorAmount ?? 0) / 100);
}

/** Per-credit unit price from a minor-unit total, always 2dp. */
export function formatPerCredit(
  minorAmount: number,
  credits: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  if (!credits) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (currency || DEFAULT_CURRENCY).toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorAmount / 100 / credits);
}

/** Format a major-unit amount (already in pounds/dollars) as currency. */
export function formatMajor(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatMoney(Math.round((amount ?? 0) * 100), currency, locale);
}
