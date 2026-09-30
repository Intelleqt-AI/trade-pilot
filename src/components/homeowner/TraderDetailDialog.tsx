import {
  Mail, Phone, MapPin, Shield, BadgeCheck, Star, Unlock, Check, X, Loader2, MessageCircle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { cn } from '@/lib/utils';
import {
  type Bid, isAwaitingQuote, isDecidable, traderName, traderBusiness,
} from '@/lib/bids';

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_PILL: Record<string, string> = {
  accepted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  purchased: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
};

interface Props {
  bid: Bid | null;
  jobTitle?: string;
  onClose: () => void;
  onDecide?: (bidId: string, status: 'accepted' | 'rejected') => void;
  onMessage?: (conversationId: string) => void;
  deciding?: boolean;
}

const TraderDetailDialog = ({ bid, jobTitle, onClose, onDecide, onMessage, deciding }: Props) => {
  if (!bid) return null;

  const profile = bid.tradepilot_profile;
  const awaiting = isAwaitingQuote(bid);
  const name = traderName(bid);
  const business = traderBusiness(bid);

  return (
    <Dialog open={!!bid} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Trader details</DialogTitle>
        </DialogHeader>

        {/* min-w-0: DialogContent is a grid; long emails would stretch it otherwise. */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-3">
            <UserAvatar
              name={name}
              src={profile?.profile_photo_url}
              size="lg"
              verified={profile?.is_verified}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-foreground">{name}</h2>
              {business && <p className="truncate text-sm text-muted-foreground">{business}</p>}
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
                STATUS_PILL[bid.status] ?? STATUS_PILL.pending,
              )}
            >
              {awaiting ? 'Interested' : bid.status}
            </span>
          </div>

          {awaiting && (
            <div className="flex items-start gap-2.5 rounded-xl bg-indigo-50 p-3.5 text-xs leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Unlock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This trader has purchased your contact details and can reach out. They haven't
                sent a quote yet — message them or wait for their price.
              </span>
            </div>
          )}

          {/* ── Quote ─────────────────────────────────────────────────────── */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {awaiting ? 'Details' : 'Quote details'}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Price</p>
                {awaiting ? (
                  <p className="mt-0.5 text-sm font-medium text-muted-foreground">No quote yet</p>
                ) : (
                  <p className="mt-0.5 font-mono text-lg font-bold text-foreground">
                    {gbp(Number(bid.amount))}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{fmtDate(bid.availability)}</p>
              </div>
              <div className="min-w-0 rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">For job</p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{jobTitle ?? '—'}</p>
              </div>
            </div>
            {bid.description && (
              <div className="mt-3 rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Notes from the trader</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{bid.description}</p>
              </div>
            )}
          </div>

          {/* ── Contact ───────────────────────────────────────────────────── */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </p>
            <div className="space-y-1.5 rounded-lg border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              {bid.contractor_email && (
                <a
                  href={`mailto:${bid.contractor_email}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{bid.contractor_email}</span>
                </a>
              )}
              {bid.contractor_phone && (
                <a
                  href={`tel:${bid.contractor_phone}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono tabular-nums">{bid.contractor_phone}</span>
                </a>
              )}
              {profile?.postcode && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{profile.postcode}</span>
                </div>
              )}
              {!bid.contractor_email && !bid.contractor_phone && (
                <p>No contact details on file.</p>
              )}
            </div>
          </div>

          {/* ── TradePilot profile ────────────────────────────────────────── */}
          {profile ? (
            <div className="overflow-hidden rounded-xl border">
              <div className="flex items-start justify-between gap-3 bg-muted/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile.business_name || business || name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[
                      profile.trade_specialty,
                      profile.years_experience ? `${profile.years_experience} yrs exp` : null,
                      profile.postcode,
                    ].filter(Boolean).join(' · ') || 'No profile details'}
                  </p>
                  {bid.distance_km != null && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {bid.distance_km * 0.621371 < 1 ? '<1 mile' : `${Math.round(bid.distance_km * 0.621371)} miles away`}
                    </p>
                  )}
                </div>
                {profile.total_ratings > 0 && profile.avg_rating != null ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {profile.avg_rating}
                    <span className="text-muted-foreground">({profile.total_ratings})</span>
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">No ratings yet</span>
                )}
              </div>

              <div className="grid grid-cols-3 divide-x border-t">
                {[
                  [profile.completed_jobs ?? 0, 'Jobs done'],
                  [profile.total_ratings ?? 0, 'Reviews'],
                  [profile.avg_rating ?? '—', 'Avg rating'],
                ].map(([value, label]) => (
                  <div key={String(label)} className="px-3 py-3 text-center">
                    <div className="font-mono text-lg font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t px-4 py-3">
                <Chip
                  icon={Shield}
                  on={profile.has_insurance}
                  onLabel="Insured"
                  offLabel="No insurance"
                  tone="emerald"
                />
                <Chip
                  icon={BadgeCheck}
                  on={profile.has_license}
                  onLabel="Licensed"
                  offLabel="No licence"
                  tone="blue"
                />
                <Chip
                  icon={BadgeCheck}
                  on={profile.is_verified}
                  onLabel="Verified"
                  offLabel="Not verified"
                  tone="teal"
                />
              </div>
            </div>
          ) : (
            <p className="rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              No TradePilot profile — this quote was submitted manually.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            {bid.conversation_id && onMessage && (
              <Button variant="outline" size="sm" onClick={() => onMessage(bid.conversation_id!)}>
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Message
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            {isDecidable(bid) && onDecide && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecide(bid.id, 'rejected')}
                  disabled={deciding}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Decline
                </Button>
                <Button size="sm" onClick={() => onDecide(bid.id, 'accepted')} disabled={deciding}>
                  {deciding ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                  Accept quote
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TONES: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
};

const Chip = ({
  icon: Icon, on, onLabel, offLabel, tone,
}: {
  icon: React.ElementType; on: boolean; onLabel: string; offLabel: string; tone: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
      on ? TONES[tone] : 'bg-muted text-muted-foreground',
    )}
  >
    <Icon className="h-3 w-3" />
    {on ? onLabel : offLabel}
  </span>
);

export default TraderDetailDialog;
