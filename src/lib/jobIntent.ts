// Carries the trade + postcode a homeowner picked on the marketing site
// (mytradepilot.io/plumbers → /join?postcode=RG1+1AA&trade=plumber) across the
// signup → verify-email → dashboard hops, so the Post a Job popup can open
// prefilled.
//
// sessionStorage is enough: the TradePilot OTP email contains no link (it is a
// code the user types on the page they are already on), so the whole journey
// stays in one tab.

const KEY = 'tp_job_intent';
// A stash older than this is stale — never pop a job dialog on a later visit.
const TTL_MS = 60 * 60 * 1000;

export interface JobIntent {
  /** Backend TRADE_CHOICES value, or '' when the landing trade isn't selectable. */
  trade: string;
  postcode: string;
  /** What the landing page actually asked for — kept so an unsupported trade can
   *  be explained rather than silently dropped. */
  requestedTrade: string;
}

interface StoredIntent extends JobIntent {
  ts: number;
}

// The marketing site emits singular snake_case slugs (plumber, gas_engineer …),
// one per trade landing page. Only the four trades with CREDIT_RULES entries can
// be selected in the job form (see TPPostJobDialog), so builder / decorator /
// kitchen_fitter / carpenter — 10 of the 22 landing pages — map to '' and the
// user picks a trade themselves.
// Plural and hyphenated forms are accepted defensively: the landing side types
// this prop as a bare `string` with no central list, so a new page can coin one.
const TRADE_SLUGS: Record<string, string> = {
  plumber: 'plumber',
  plumbers: 'plumber',
  plumbing: 'plumber',
  electrician: 'electrician',
  electricians: 'electrician',
  electrical: 'electrician',
  roofer: 'roofer',
  roofers: 'roofer',
  roofing: 'roofer',
  gas_engineer: 'gas_engineer',
  gas_engineers: 'gas_engineer',
  'gas-engineer': 'gas_engineer',
  'gas-engineers': 'gas_engineer',
};

/** Human label for a landing slug we can't select, e.g. 'kitchen_fitter' → 'kitchen fitter'. */
export const requestedTradeLabel = (raw: string): string =>
  raw.trim().toLowerCase().replace(/[_-]+/g, ' ');

/** Landing-site trade slug → backend TRADE_CHOICES value, or '' if unsupported. */
export const normaliseTrade = (raw?: string | null): string => {
  if (!raw) return '';
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return TRADE_SLUGS[key] ?? '';
};

export const normalisePostcode = (raw?: string | null): string =>
  (raw ?? '').trim().toUpperCase().replace(/\s+/g, ' ');

export function writeJobIntent(intent: JobIntent): void {
  if (!intent.trade && !intent.postcode && !intent.requestedTrade) return;
  try {
    const stored: StoredIntent = { ...intent, ts: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // private mode / storage disabled — the flow degrades to a normal signup
  }
}

/** Build an intent from the landing page's query string. Parse with
 *  URLSearchParams: the postcode space is '+'-encoded, which decodeURIComponent
 *  would leave as a literal plus. */
export function intentFromParams(params: URLSearchParams): JobIntent {
  const requestedTrade = (params.get('trade') ?? '').trim();
  return {
    trade: normaliseTrade(requestedTrade),
    postcode: normalisePostcode(params.get('postcode')),
    requestedTrade,
  };
}

export function readJobIntent(): JobIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIntent>;
    if (typeof parsed?.ts !== 'number' || Date.now() - parsed.ts > TTL_MS) {
      clearJobIntent();
      return null;
    }
    const trade = parsed.trade ?? '';
    const postcode = parsed.postcode ?? '';
    const requestedTrade = parsed.requestedTrade ?? '';
    return trade || postcode || requestedTrade
      ? { trade, postcode, requestedTrade }
      : null;
  } catch {
    return null;
  }
}

export function clearJobIntent(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
