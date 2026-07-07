/**
 * Design-mock data for modules the new TradePilot design shows but the
 * backend does not serve yet. Every export is tagged TODO(backend) — when an
 * endpoint lands, replace the import site with a query and delete the export.
 *
 * Derivation helpers at the bottom are deterministic (stable per job id) so
 * values never change between renders or refetches.
 */

export type SeriesPeriod = '7d' | '30d' | '12m';

// TODO(backend): earnings time-series endpoint
export const MOCK_EARN_SERIES: Record<SeriesPeriod, number[]> = {
  '7d': [420, 680, 540, 900, 760, 1120, 980],
  '30d': [2100, 2600, 2400, 3100, 2900, 3600, 3300, 4200, 3800, 4400, 4820],
  '12m': [2400, 2800, 3100, 2600, 3400, 3900, 3700, 4200, 4100, 4600, 4300, 4820],
};

// TODO(backend): revenue footer stats (bids placed / avg job value / repeat customers)
export const MOCK_REVENUE_FOOTER = [
  { label: 'Bids placed', value: '19' },
  { label: 'Avg job value', value: '£385' },
  { label: 'Repeat customers', value: '31%' },
];

// TODO(backend): period-over-period KPI deltas
export const MOCK_KPI_DELTAS = {
  earnings: { direction: 'up' as const, value: '+18%' },
  jobsWon: { direction: 'up' as const, value: '+4' },
  winRate: { direction: 'up' as const, value: '+6 pts' },
};

// TODO(backend): calendar/appointments endpoint
export const MOCK_SCHEDULE = [
  { time: '08:30', dur: '1h', title: 'Boiler service — Ada Nwosu', place: 'SE5 · Camberwell', tone: 'brand' as const },
  { time: '10:30', dur: '45m', title: 'Quote visit — bathroom re-pipe', place: 'SE22 · Dulwich', tone: 'info' as const },
  { time: '13:00', dur: '2h', title: 'Emergency leak — Sara Kelly', place: 'SE16 · Rotherhithe', tone: 'danger' as const },
  { time: '16:00', dur: '30m', title: 'Consumer unit survey', place: 'SE15 · Peckham', tone: 'neutral' as const },
];

// TODO(backend): market analytics endpoint (win rate + jobs-this-week are derived live)
export const MOCK_MARKET_INSIGHTS = {
  avgValue: 385,
  competition: 'Medium',
};

// TODO(backend): credit analytics endpoint (monthly bars are derived from
// credit-history where available; these are the fallbacks)
export const MOCK_CREDIT_USAGE = {
  monthlySpend: [8, 12, 10, 15, 11, 18, 14, 21, 16, 24, 20, 22],
  byCategory: [
    { label: 'Plumbing', credits: 68, colorClass: 'bg-teal-500' },
    { label: 'Gas / boilers', credits: 42, colorClass: 'bg-blue-500' },
    { label: 'Electrical', credits: 34, colorClass: 'bg-violet-500' },
    { label: 'Other trades', credits: 18, colorClass: 'bg-gray-400' },
  ],
  avgPerBid: 12,
  costPerWin: 34,
  spent30d: 48,
  bought30d: 62,
};

// TODO(backend): support ticket system
export const MOCK_TICKETS = [
  { id: 'TP-014', subject: 'Payout timing for completed jobs', status: 'in_progress' as const, updated: '2h ago' },
  { id: 'TP-009', subject: 'Profile verification — Gas Safe number', status: 'resolved' as const, updated: '3d ago' },
  { id: 'TP-002', subject: 'Update saved payment method', status: 'resolved' as const, updated: '1w ago' },
];

export const SUPPORT_CHANNELS = [
  {
    key: 'chat',
    title: 'Live chat',
    description: 'Chat with the support team from the app.',
    meta: 'Mon–Fri, 8am–6pm',
    cta: 'Start a chat',
    href: null,
    tone: 'brand' as const,
  },
  {
    key: 'phone',
    title: 'Call us',
    description: 'Talk to us about anything account related.',
    meta: '0800 048 8955',
    cta: 'Call support',
    href: 'tel:08000488955',
    tone: 'navy' as const,
  },
  {
    key: 'email',
    title: 'Email',
    description: 'Send the detail and we reply within one working day.',
    meta: 'help@tradepilot.co.uk',
    cta: 'Email support',
    href: 'mailto:help@tradepilot.co.uk',
    tone: 'accent' as const,
  },
];

// TODO(backend): help-centre content
export const SUPPORT_FAQS = [
  {
    topic: 'Bidding',
    q: 'How do credits work when I bid?',
    a: 'Each bid costs the number of credits shown on the job card. Credits are only spent when you place the bid — browsing the Job Market is free.',
  },
  {
    topic: 'Bidding',
    q: 'What happens after I place a bid?',
    a: 'The homeowner reviews all bids and accepts one. When your bid is accepted the job moves to My Jobs and the homeowner contact details unlock.',
  },
  {
    topic: 'Credits',
    q: 'Do credits expire?',
    a: 'No. Credits stay on your account until you spend them on bids.',
  },
  {
    topic: 'Payouts',
    q: 'How do I get paid for completed jobs?',
    a: 'You agree payment directly with the homeowner. TradePilot credits only cover bidding — we never take a cut of the job value.',
  },
  {
    topic: 'Verification',
    q: 'How do I get the verified badge?',
    a: 'Upload your certifications (e.g. Gas Safe, public liability insurance) in My Profile. Once reviewed, the verified badge shows on your profile and bids.',
  },
  {
    topic: 'Getting started',
    q: 'How do I widen or move my search area?',
    a: 'Open Job Market and select the radius button in the toolbar, or edit your service area in My Profile — drag the pin and set the radius.',
  },
];

// TODO(backend): response-time + area-ranking analytics
export const MOCK_PROFILE_EXTRAS = {
  respondsIn: '~52 min',
  areaRank: 'Top 5% in your area',
};

/* ----------------------- derivation helpers ----------------------- */

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Deterministic match score (55–98) for a feed job. Uses trade-specialty
 * overlap and distance falloff plus a stable per-job jitter so the score
 * never changes between renders.
 * TODO(backend): replace with a real relevance score from the feed.
 */
export function deriveMatchScore(
  job: { id: number | string; category?: string; trade?: string; distance_km?: number | null },
  profile?: { trade_specialty?: string | null }
): number {
  let score = 68;
  const specialty = (profile?.trade_specialty || '').toLowerCase();
  const jobTrade = `${job.category ?? ''} ${job.trade ?? ''}`.toLowerCase();
  if (specialty && jobTrade.includes(specialty)) score += 18;
  const distance = Number(job.distance_km ?? 8);
  score -= Math.min(14, Math.round(distance * 0.8));
  score += stableHash(String(job.id)) % 12;
  return Math.max(55, Math.min(98, score));
}

/** Competition banding from the real bids count on the job. */
export function deriveCompetition(
  bidsCount: number | undefined | null
): 'low' | 'medium' | 'high' {
  const n = Number(bidsCount ?? 0);
  if (n <= 2) return 'low';
  if (n <= 5) return 'medium';
  return 'high';
}

/**
 * Estimated job value band derived from the credit cost of bidding.
 * TODO(backend): replace with a real estimate from the job feed.
 */
export function deriveValueRange(job: {
  id: number | string;
  bid_credits?: number | null;
}): { low: number; high: number } {
  const credits = Number(job.bid_credits ?? 10);
  const jitter = (stableHash(String(job.id)) % 5) * 10;
  const low = credits * 10 + jitter;
  const high = Math.round(low * (1.6 + (stableHash(String(job.id)) % 3) * 0.15));
  return { low, high };
}
