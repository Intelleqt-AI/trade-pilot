// Shape returned by BidSerializer (backend/apps/jobs/serializers.py).
// Field names here must match that serializer exactly — reading invented keys is
// what made the bid card render "Trader — £0" with no contact details.

export interface TraderProfile {
  user_id: string;
  business_name: string;
  trade_specialty: string;
  years_experience: string;
  postcode: string;
  has_insurance: boolean;
  has_license: boolean;
  is_verified: boolean;
  completed_jobs: number;
  avg_rating: number | null;
  total_ratings: number;
  profile_photo_url: string | null;
}

export interface Bid {
  id: string;
  contractor_name: string;
  contractor_email: string;
  contractor_phone: string;
  company_name: string;
  /** Null until the trader submits an actual quote — a purchased lead has no amount. */
  amount: string | number | null;
  description: string;
  availability: string | null;
  status: string;
  rating: number | null;
  rating_comment: string;
  rated_at: string | null;
  tradepilot_profile: TraderProfile | null;
  conversation_id: string | null;
  /** Ranking fields — populated by the backend ranking algorithm. Null for unquoted bids. */
  match_score: number | null;
  distance_km: number | null;
  tag: string | null;
  tag_kind: 'best_deal' | 'best_price' | 'top_rated' | 'closest' | null;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

/** A trader who bought the lead but has not priced it yet. */
export const isAwaitingQuote = (bid: Pick<Bid, 'status' | 'amount'>): boolean =>
  bid.status === 'purchased' || bid.amount == null;

/** Only a real, priced quote counts — a purchased lead is interest, not a quote. */
export const isQuoted = (bid: Pick<Bid, 'status' | 'amount'>): boolean => !isAwaitingQuote(bid);

export const countQuotes = (bids: Pick<Bid, 'status' | 'amount'>[] = []): number =>
  bids.filter(isQuoted).length;

export const countAwaiting = (bids: Pick<Bid, 'status' | 'amount'>[] = []): number =>
  bids.filter(isAwaitingQuote).length;

/** Accept/Decline only make sense once there is a price to accept; the server
 *  rejects accepting an unquoted bid outright. */
export const isDecidable = (bid: Pick<Bid, 'status' | 'amount'>): boolean =>
  isQuoted(bid) && (bid.status === 'pending' || !bid.status);

export const traderName = (bid: Bid): string =>
  bid.contractor_name?.trim() || bid.tradepilot_profile?.business_name?.trim() || 'Trader';

export const traderBusiness = (bid: Bid): string =>
  bid.company_name?.trim() || bid.tradepilot_profile?.business_name?.trim() || '';
