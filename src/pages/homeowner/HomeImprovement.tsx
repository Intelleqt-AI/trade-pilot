import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Hammer, Plus, Star, MessageSquare, Check, X, Loader2, ChevronDown,
  Unlock, Shield, BadgeCheck, MessageCircle, Pencil, Trash2, Lock, MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { StatCard } from '@/components/trade-pilot/StatCard';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { type ApiError, firstApiMessage } from '@/lib/api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { getTradeLabel } from '@/lib/jobCategories';
import { fetchJobs, respondToBid, rateBid, deleteJob } from '@/lib/api/tpHomeowner';
import {
  type Bid, isAwaitingQuote, isDecidable, countQuotes, countAwaiting,
  traderName, traderBusiness,
} from '@/lib/bids';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import TPPostJobDialog, { type EditableJob } from '@/components/homeowner/TPPostJobDialog';
import TraderDetailDialog from '@/components/homeowner/TraderDetailDialog';

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);

const KM_TO_MILES = 0.621371;
const fmtDist = (km: number) =>
  km * KM_TO_MILES < 1 ? '<1 mile' : `${Math.round(km * KM_TO_MILES)} miles away`;

type SortBy = 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';

const TAG_CLS: Record<string, string> = {
  best_deal: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  best_price: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  top_rated: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
  closest: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

const sortBids = (bids: Bid[], sortBy: SortBy): Bid[] => {
  const quoted = bids.filter(b => !isAwaitingQuote(b));
  const awaiting = bids.filter(b => isAwaitingQuote(b));
  const sorted = [...quoted].sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return Number(a.amount ?? 0) - Number(b.amount ?? 0);
      case 'price_high': return Number(b.amount ?? 0) - Number(a.amount ?? 0);
      case 'rating': return (b.tradepilot_profile?.avg_rating ?? 0) - (a.tradepilot_profile?.avg_rating ?? 0);
      case 'distance': return (a.distance_km ?? 999) - (b.distance_km ?? 999);
      default: return (a.rank ?? 999) - (b.rank ?? 999); // recommended
    }
  });
  return [...sorted, ...awaiting];
};

// Mirrors JobLead.STATUS_CHOICES — accepting a quote moves a job to 'todo',
// so omitting it here hides the job from every filter tab.
const STATUS_META: Record<string, { label: string; style: string }> = {
  open: { label: 'Open', style: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  todo: { label: 'Scheduled', style: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  in_progress: { label: 'In progress', style: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  completed: { label: 'Completed', style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  cancelled: { label: 'Cancelled', style: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
  removed: { label: 'Removed', style: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
};

export const ACTIVE_STATUSES = ['open', 'todo', 'in_progress'];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'todo', label: 'Scheduled' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
] as const;

const HomeImprovement = () => {
  const queryClient = useQueryClient();
  const [postOpen, setPostOpen] = useState(false);
  const [filter, setFilter] = useState<typeof FILTERS[number]['key']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rating, setRating] = useState<{ jobId: string; bidId: string } | null>(null);
  const [detail, setDetail] = useState<{ bid: Bid; jobTitle: string } | null>(null);
  const [editJob, setEditJob] = useState<EditableJob | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [bidSort, setBidSort] = useState<SortBy>('recommended');
  const navigate = useNavigate();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['ho-jobs'],
    queryFn: fetchJobs,
  });

  const jobList: any[] = Array.isArray(jobs) ? jobs : [];
  const visible = filter === 'all' ? jobList : jobList.filter(j => j.status === filter);

  const bidMutation = useMutation({
    mutationFn: ({ jobId, bidId, status }: { jobId: string; bidId: string; status: string }) =>
      respondToBid(jobId, bidId, { status }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['ho-jobs'] });
      toast.success(v.status === 'accepted' ? 'Quote accepted' : 'Quote declined');
    },
    onError: () => toast.error('Could not update the quote.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ho-jobs'] });
      toast.success('Job deleted.');
      setConfirmDelete(null);
    },
    onError: (err: ApiError) => {
      // The server refuses once a trader has paid for the lead; surface its
      // reason rather than a generic failure.
      toast.error(
        firstApiMessage(err?.response?.data?.errors?.detail) ??
          err?.response?.data?.message ??
          'Could not delete this job.',
      );
      setConfirmDelete(null);
    },
  });

  const stats = {
    total: jobList.length,
    active: jobList.filter(j => ACTIVE_STATUSES.includes(j.status)).length,
    // Only priced quotes count — a purchased lead is interest, not a quote.
    quotes: jobList.reduce((n, j) => n + countQuotes(j.bids ?? []), 0),
    completed: jobList.filter(j => j.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Home Improvements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post jobs and manage the quotes you receive from traders.
          </p>
        </div>
        <Button onClick={() => setPostOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Post a job
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total jobs" value={stats.total} icon={Hammer} tone="navy" />
        <StatCard label="Active" value={stats.active} icon={Hammer} tone="brand" />
        <StatCard label="Quotes received" value={stats.quotes} icon={MessageSquare} tone="accent" />
        <StatCard label="Completed" value={stats.completed} icon={Check} tone="brand" />
      </div>

      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
              filter === f.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={Hammer}
            title={filter === 'all' ? 'No jobs yet' : `No ${filter.replace('_', ' ')} jobs`}
            description="Post a job and verified traders in your area will send you quotes."
            action={
              <Button onClick={() => setPostOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Post a job
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(job => {
            const bids: Bid[] = job.bids ?? [];
            const quoteCount = countQuotes(bids);
            const awaitingCount = countAwaiting(bids);
            const isOpen = expanded === job.id;
            // A bid only exists because a trader paid to unlock this lead, so
            // deleting would destroy what they bought. The server refuses on the
            // same condition — this hides the button rather than contradicting it.
            const isPurchased = bids.length > 0;
            const isAccepted = ['todo', 'in_progress', 'completed'].includes(job.status);
            const toggle = () => setExpanded(isOpen ? null : job.id);
            return (
              <div key={job.id} className="rounded-xl border bg-card">
                {/* Not one big <button>: the row holds Edit/Delete buttons, which
                    cannot legally nest inside another button. */}
                <div className="flex w-full items-start gap-4 p-5">
                  <button onClick={toggle} className="flex min-w-0 flex-1 items-start gap-4 text-left">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Hammer className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">{job.title}</h3>
                        <Badge className={cn('border-0 text-[10px]', (STATUS_META[job.status] ?? STATUS_META.open).style)}>
                          {(STATUS_META[job.status] ?? STATUS_META.open).label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getTradeLabel(job.trade)}
                        {job.postcode ? ` · ${job.postcode}` : ''}
                        {job.created_at
                          ? ` · posted ${formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}`
                          : ''}
                      </p>
                      {job.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{job.description}</p>
                      )}
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      {quoteCount > 0
                        ? `${quoteCount} quote${quoteCount === 1 ? '' : 's'}${awaitingCount > 0 ? ` · ${awaitingCount} interested` : ''}`
                        : awaitingCount > 0
                          ? `${awaitingCount} interested`
                          : 'Awaiting quotes'}
                    </span>

                    {!isAccepted && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit job"
                        aria-label={`Edit ${job.title}`}
                        onClick={() => setEditJob({
                          id: job.id,
                          property: job.property,
                          title: job.title,
                          trade: job.trade,
                          category: job.category,
                          description: job.description,
                          postcode: job.postcode,
                          urgency: job.urgency,
                          priority: job.priority,
                          answers: job.answers,
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {!isAccepted && (
                      isPurchased ? (
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground/50"
                          title="A trader has paid to contact you about this job, so it can no longer be deleted."
                        >
                          <Lock className="h-4 w-4" />
                        </span>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete job"
                          aria-label={`Delete ${job.title}`}
                          onClick={() => setConfirmDelete({ id: job.id, title: job.title })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )
                    )}

                    <button onClick={toggle} className="p-1" aria-label={isOpen ? 'Collapse' : 'Expand'}>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                    </button>
                  </div>
                </div>

                {/* Progress tracker — only for booked/active/completed jobs */}
                {['todo', 'in_progress', 'completed'].includes(job.status) && (
                  <div className="px-5 pb-4 flex items-start">
                    {[
                      { key: 'todo', label: 'Booked', date: job.todo_at },
                      { key: 'in_progress', label: 'In Progress', date: job.started_at },
                      { key: 'completed', label: 'Completed', date: job.completed_at },
                    ].map((step, i, arr) => {
                      const order = ['todo', 'in_progress', 'completed'];
                      const jobIdx = order.indexOf(job.status);
                      const done = i <= jobIdx;
                      const active = step.key === job.status;
                      const isLast = i === arr.length - 1;
                      return (
                        <div key={step.key} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${done ? 'bg-primary border-primary' : 'bg-white border-[#D1D5DB] dark:bg-background'}`}>
                              {done && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${active ? 'text-primary' : done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                              {step.label}
                            </span>
                            {step.date && (
                              <span className="text-[9px] text-muted-foreground/50 mt-0.5">
                                {new Date(step.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          {!isLast && (
                            <div className={`flex-1 h-0.5 mx-2 mt-2.5 rounded-full transition-all ${order.indexOf(arr[i + 1].key) <= jobIdx ? 'bg-primary' : 'bg-[#E5E7EB] dark:bg-border'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isOpen && (
                  <div className="border-t px-5 py-4">
                    {bids.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No quotes yet — traders will send them here.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {countQuotes(bids) >= 2 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              {countQuotes(bids)} quote{countQuotes(bids) !== 1 ? 's' : ''}
                              {countAwaiting(bids) > 0 && ` · ${countAwaiting(bids)} interested`}
                            </span>
                            <Select value={bidSort} onValueChange={v => setBidSort(v as SortBy)}>
                              <SelectTrigger className="h-8 w-[160px] text-xs">
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="recommended">Best match</SelectItem>
                                <SelectItem value="price_low">Price: low to high</SelectItem>
                                <SelectItem value="price_high">Price: high to low</SelectItem>
                                <SelectItem value="rating">Highest rated</SelectItem>
                                <SelectItem value="distance">Closest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {sortBids(bids, bidSort).map((bid: Bid) => {
                          const profile = bid.tradepilot_profile;
                          const awaiting = isAwaitingQuote(bid);
                          const business = traderBusiness(bid);
                          return (
                            <div key={bid.id} className={cn(
                              'flex flex-wrap items-start gap-3 rounded-lg border p-4',
                              bid.rank === 1 && !awaiting && 'ring-2 ring-primary/20 bg-primary/[0.02]',
                            )}>
                              <UserAvatar
                                name={traderName(bid)}
                                src={profile?.profile_photo_url}
                                size="md"
                                verified={profile?.is_verified}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {traderName(bid)}
                                  </p>
                                  {profile?.total_ratings ? (
                                    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      {profile.avg_rating}
                                      <span className="text-muted-foreground/70">({profile.total_ratings})</span>
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/70">New</span>
                                  )}
                                  {bid.tag && bid.tag_kind && (
                                    <span className={cn(
                                      'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                      TAG_CLS[bid.tag_kind] ?? 'bg-muted text-muted-foreground',
                                    )}>
                                      {bid.tag}
                                    </span>
                                  )}
                                </div>
                                {business && (
                                  <p className="truncate text-xs text-muted-foreground">{business}</p>
                                )}
                                {bid.distance_km != null && !awaiting && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {fmtDist(bid.distance_km)}
                                  </span>
                                )}

                                {awaiting ? (
                                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                                    <Unlock className="h-3 w-3 shrink-0" />
                                    Interested — purchased your details, awaiting quote
                                  </div>
                                ) : (
                                  bid.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                      {bid.description}
                                    </p>
                                  )
                                )}

                                {profile && (profile.has_insurance || profile.has_license) && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {profile.has_insurance && (
                                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                        <Shield className="h-2.5 w-2.5" /> Insured
                                      </span>
                                    )}
                                    {profile.has_license && (
                                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                        <BadgeCheck className="h-2.5 w-2.5" /> Licensed
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                {!awaiting && (
                                  <div className="font-mono text-lg font-semibold text-foreground">
                                    {gbp(Number(bid.amount))}
                                  </div>
                                )}
                                {bid.status === 'accepted' && (
                                  <Badge className="mt-1 border-0 bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    Accepted
                                  </Badge>
                                )}
                                {bid.status === 'rejected' && (
                                  <Badge className="mt-1 border-0 bg-muted text-[10px]">Declined</Badge>
                                )}
                              </div>

                              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                <Button size="sm" variant="outline" onClick={() => setDetail({ bid, jobTitle: job.title })}>
                                  View details
                                </Button>
                                {bid.conversation_id && (
                                  <Button size="sm" variant="outline" onClick={() => navigate('/homeowner/messages', { state: { conversationId: bid.conversation_id } })}>
                                    <MessageCircle className="mr-1 h-3.5 w-3.5" />
                                    Message
                                  </Button>
                                )}
                                {isDecidable(bid) && (
                                  <Button
                                    size="sm"
                                    onClick={() => bidMutation.mutate({ jobId: job.id, bidId: bid.id, status: 'accepted' })}
                                    disabled={bidMutation.isPending}
                                  >
                                    <Check className="mr-1 h-3.5 w-3.5" />
                                    Accept
                                  </Button>
                                )}
                                {bid.status === 'accepted' && job.status === 'completed' && !bid.rating && (
                                  <Button size="sm" variant="outline" onClick={() => setRating({ jobId: job.id, bidId: bid.id })}>
                                    <Star className="mr-1 h-3.5 w-3.5" />
                                    Rate
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TPPostJobDialog open={postOpen} onOpenChange={setPostOpen} />

      {/* Separate instance from the "Post a job" one: mounting it only while a job
          is selected means its form seeds from that job on open and never carries
          state between the two flows. */}
      {editJob && (
        <TPPostJobDialog
          open
          job={editJob}
          onOpenChange={v => { if (!v) setEditJob(null); }}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={v => { if (!v) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirmDelete?.title}&rdquo; will be removed permanently, along with
              any photos you attached. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={e => {
                // Keep the dialog up while the request runs; the mutation closes it.
                e.preventDefault();
                if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
              }}
            >
              {deleteMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TraderDetailDialog
        bid={detail?.bid ?? null}
        jobTitle={detail?.jobTitle}
        onClose={() => setDetail(null)}
        deciding={bidMutation.isPending}
        onMessage={(conversationId) => { setDetail(null); navigate('/homeowner/messages', { state: { conversationId } }); }}
        onDecide={(bidId, status) => {
          const job = jobList.find(j => (j.bids ?? []).some((b: Bid) => b.id === bidId));
          if (job) bidMutation.mutate({ jobId: job.id, bidId, status });
          setDetail(null);
        }}
      />
      <RateDialog
        target={rating}
        onClose={() => setRating(null)}
        onDone={() => queryClient.invalidateQueries({ queryKey: ['ho-jobs'] })}
      />
    </div>
  );
};

const RateDialog = ({
  target, onClose, onDone,
}: {
  target: { jobId: string; bidId: string } | null;
  onClose: () => void;
  onDone: () => void;
}) => {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');

  const mutation = useMutation({
    mutationFn: () => rateBid(target!.jobId, target!.bidId, { rating: stars, review: review.trim() }),
    onSuccess: () => {
      toast.success('Thanks for your review');
      onDone();
      onClose();
      setStars(5);
      setReview('');
    },
    onError: () => toast.error('Could not submit your review.'),
  });

  return (
    <Dialog open={!!target} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this tradesperson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setStars(n)}>
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    n <= stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            rows={4}
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="How did the work go? (optional)"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeImprovement;
