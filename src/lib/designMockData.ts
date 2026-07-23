/**
 * Design-mock data for modules the new TradePilot design shows but the
 * backend does not serve yet. Every export is tagged TODO(backend) — when an
 * endpoint lands, replace the import site with a query and delete the export.
 *
 * Derivation helpers at the bottom are deterministic (stable per job id) so
 * values never change between renders or refetches.
 */

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
    q: 'What happens after I purchase lead contact details?',
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

// TODO(backend): area-ranking analytics.
// Response-time ("responds in") is intentionally omitted — it requires a
// homeowner<->trader messaging system that does not exist yet, so no honest
// average reply time can be computed. Re-add once messaging is built.
export const MOCK_PROFILE_EXTRAS = {
  areaRank: 'Top 5% in your area',
};

/* ----------------------- derivation helpers ----------------------- */

/** Competition banding from the real bids count on the job. */
export function deriveCompetition(
  bidsCount: number | undefined | null
): 'low' | 'medium' | 'high' {
  const n = Number(bidsCount ?? 0);
  if (n <= 2) return 'low';
  if (n <= 5) return 'medium';
  return 'high';
}
