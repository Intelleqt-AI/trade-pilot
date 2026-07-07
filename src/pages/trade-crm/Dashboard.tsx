import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBids, fetchData } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/trade-pilot/StatCard';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { SectionLabel } from '@/components/trade-pilot/SectionLabel';
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { MatchRing } from '@/components/trade-pilot/MatchRing';
import { ProgressRing } from '@/components/trade-pilot/ProgressRing';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { RevenueAreaChart } from '@/components/trade-pilot/charts/RevenueAreaChart';
import { profileStrength } from '@/lib/profileStrength';
import {
  MOCK_EARN_SERIES,
  MOCK_KPI_DELTAS,
  MOCK_PROFILE_EXTRAS,
  MOCK_REVENUE_FOOTER,
  MOCK_SCHEDULE,
  MOCK_CREDIT_USAGE,
  deriveMatchScore,
  deriveCompetition,
  deriveValueRange,
  type SeriesPeriod,
} from '@/lib/designMockData';
import { toneDot, urgencyBadgeTone, urgencyLabel } from '@/components/trade-pilot/tones';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Clock,
  Coins,
  FileText,
  MapPin,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { TradeCRMOutletContext } from '@/layouts/TradeCRMLayout';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const competitionLabel = {
  low: 'Low competition',
  medium: 'Some competition',
  high: 'High competition',
} as const;

const competitionTone = { low: 'success', medium: 'warning', high: 'danger' } as const;

const scheduleRail: Record<string, string> = {
  brand: 'bg-teal-500',
  info: 'bg-blue-500',
  danger: 'bg-red-500',
  neutral: 'bg-gray-400',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const { user, profile } = useAuth();
  const [period, setPeriod] = useState<SeriesPeriod>('30d');

  const { data: jobFeedData } = useQuery({
    queryKey: ['JobFeed'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/'),
  });

  const { data: myBidsData } = useQuery({ queryKey: ['MyBids'], queryFn: fetchMyBids });

  const { data: creditHistoryData } = useQuery({
    queryKey: ['CreditHistory'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/credit-history/'),
  });

  const { data: paymentsHistoryData } = useQuery({
    queryKey: ['PaymentsHistory'],
    queryFn: () => fetchData<any>('/api/v1/payments/history/'),
  });

  const creditBalance =
    jobMarketCredits ?? (user as any)?.credit_balance ?? (profile as any)?.credit ?? 0;

  const feedJobs: any[] = Array.isArray(jobFeedData)
    ? jobFeedData
    : jobFeedData?.data ?? jobFeedData?.results ?? [];
  const myBids: any[] = Array.isArray(myBidsData) ? myBidsData : [];

  // Derived KPIs from real bids
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const acceptedBids = myBids.filter(b => b.status === 'accepted');
  const acceptedThisMonth = acceptedBids.filter(b => new Date(b.created_at) >= monthStart);
  const earningsThisMonth = acceptedThisMonth.reduce((s, b) => s + Number(b.amount || 0), 0);
  const winRate = myBids.length ? Math.round((acceptedBids.length / myBids.length) * 100) : 0;
  const ratedBids = acceptedBids.filter(b => b.rating != null);
  const avgRating = ratedBids.length
    ? (ratedBids.reduce((s, b) => s + Number(b.rating), 0) / ratedBids.length).toFixed(1)
    : null;

  // Credits spent / bought over the last 30 days (real history, mock fallback)
  const last30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const creditEntries: any[] = Array.isArray(creditHistoryData)
    ? creditHistoryData
    : creditHistoryData?.data ?? creditHistoryData?.results ?? [];
  const paymentEntries: any[] = Array.isArray(paymentsHistoryData)
    ? paymentsHistoryData
    : paymentsHistoryData?.data ?? paymentsHistoryData?.results ?? [];
  const spent30d = creditEntries.length
    ? creditEntries
        .filter(e => new Date(e.created_at ?? e.date ?? 0).getTime() >= last30)
        .reduce((s, e) => s + Math.abs(Number(e.credits ?? e.amount ?? 0)), 0)
    : MOCK_CREDIT_USAGE.spent30d;
  const bought30d = paymentEntries.length
    ? paymentEntries
        .filter(e => new Date(e.created_at ?? e.date ?? 0).getTime() >= last30)
        .reduce((s, e) => s + Number(e.credits ?? 0), 0)
    : MOCK_CREDIT_USAGE.bought30d;
  const spendRatio =
    spent30d + creditBalance > 0
      ? Math.min(100, Math.round((spent30d / (spent30d + creditBalance)) * 100))
      : 0;

  const radiusKm = (profile as any)?.radius_km ?? (profile as any)?.radius ?? 25;
  const strength = profileStrength(profile, creditBalance);

  const rankedJobs = [...feedJobs]
    .map(j => ({ job: j, match: deriveMatchScore(j, profile ?? undefined) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-4">
      {/* Greeting header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-display font-semibold text-foreground">
              {greeting}, {user?.first_name || 'there'}
            </h1>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available for work
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {today} · here's your business at a glance.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => toast('Quotes are coming soon')}>
            <FileText className="h-4 w-4" />
            New quote
          </Button>
          <Button onClick={() => navigate('/trades-crm/job-market')}>
            <Search className="h-4 w-4" />
            Browse jobs
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Earnings · this month"
          value={`£${earningsThisMonth.toLocaleString('en-GB')}`}
          sub="vs last month"
          icon={Wallet}
          tone="brand"
          delta={MOCK_KPI_DELTAS.earnings}
        />
        <StatCard
          label="Jobs won"
          value={String(acceptedThisMonth.length)}
          sub="this month"
          icon={Trophy}
          tone="success"
          delta={MOCK_KPI_DELTAS.jobsWon}
        />
        <StatCard
          label="Win rate"
          value={`${winRate}%`}
          sub={`${myBids.length} bids placed`}
          icon={Target}
          tone="violet"
          delta={MOCK_KPI_DELTAS.winRate}
        />
        <StatCard
          label="Jobs near you"
          value={String(feedJobs.length)}
          sub={`within ${radiusKm} km`}
          icon={MapPin}
          tone="accent"
          badge={
            feedJobs.length > 0 ? (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-orange-500">
                New
              </span>
            ) : undefined
          }
          onClick={() => navigate('/trades-crm/job-market')}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.62fr_1fr]">
        {/* LEFT column */}
        <div className="flex flex-col gap-4">
          <SectionCard
            title="New jobs near you"
            subtitle={`${feedJobs.length} live · ranked by match, distance & value`}
            icon={Sparkles}
            action={
              <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/job-market')}>
                Open market
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
            bodyClassName="p-0"
          >
            {rankedJobs.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No jobs in your area yet"
                description="Widen your search radius or check back soon — new jobs are posted every day."
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/job-market')}>
                    Open Job Market
                  </Button>
                }
              />
            ) : (
              rankedJobs.map(({ job, match }, i) => {
                const comp = deriveCompetition(job.bids_count);
                const range = deriveValueRange(job);
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate('/trades-crm/job-market')}
                    className={cn(
                      'flex cursor-pointer items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-gray-50',
                      i > 0 && 'border-t border-gray-100'
                    )}
                  >
                    <MatchRing value={match} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{job.title}</span>
                        <Badge tone={urgencyBadgeTone(job.urgency)} size="sm">
                          {urgencyLabel(job.urgency)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {job.trade || job.category}
                        </span>
                        {job.distance_km != null && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono tabular-nums">{job.distance_km} km</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono tabular-nums">
                            £{range.low}–{range.high}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className={cn('h-1.5 w-1.5 rounded-full', toneDot[competitionTone[comp]])} />
                          {competitionLabel[comp]}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
                      <Button variant="outline" size="sm">
                        Bid · <span className="font-mono tabular-nums">{job.bid_credits}</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </SectionCard>

          {/* Revenue */}
          <SectionCard>
            <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <SectionLabel>Revenue</SectionLabel>
                <div className="mt-1.5 flex items-baseline gap-2.5">
                  <span className="font-mono text-[30px] font-semibold tabular-nums tracking-tight text-foreground">
                    £{earningsThisMonth.toLocaleString('en-GB')}
                  </span>
                  <Badge tone="success" size="sm" dot>
                    {MOCK_KPI_DELTAS.earnings.value} vs last month
                  </Badge>
                </div>
              </div>
              <SegmentedControl
                size="sm"
                value={period}
                onChange={v => setPeriod(v as SeriesPeriod)}
                items={[
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' },
                  { value: '12m', label: '12m' },
                ]}
              />
            </div>
            <RevenueAreaChart series={MOCK_EARN_SERIES[period]} className="h-40 w-full" />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              {MOCK_REVENUE_FOOTER.map(stat => (
                <div key={stat.label}>
                  <div className="mb-0.5 text-xs text-muted-foreground">{stat.label}</div>
                  <div className="font-mono text-h3 font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-4">
          {/* Credit balance panel */}
          <div className="rounded-xl bg-navy-800 p-5 text-white shadow-sm">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-overline font-semibold uppercase text-white/55">
                Credit balance
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/30 text-teal-200">
                <Coins className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[38px] font-semibold tabular-nums tracking-tight">
                {creditBalance}
              </span>
              <span className="text-[13px] text-white/60">
                credits · ≈ {Math.floor(creditBalance / 12)} bids
              </span>
            </div>
            <Progress value={spendRatio} className="mb-2 mt-4 h-1.5 bg-white/15" />
            <div className="mb-4 flex justify-between text-[11px] text-white/55">
              <span>
                <span className="font-mono tabular-nums">{spent30d}</span> spent this month
              </span>
              <span>
                <span className="font-mono tabular-nums">{bought30d}</span> bought
              </span>
            </div>
            <Button className="w-full" onClick={() => navigate('/trades-crm/credits')}>
              <Plus className="h-4 w-4" />
              Top up credits
            </Button>
          </div>

          {/* Profile strength */}
          <SectionCard title="Profile strength" subtitle="How homeowners see you" icon={ShieldCheck}>
            <div className="mb-4 flex items-center gap-4">
              <ProgressRing value={strength.percent} size={64} stroke={7} />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <Star className="h-[15px] w-[15px] fill-amber-500 text-amber-500" />
                  <span className="font-mono text-h3 font-semibold tabular-nums text-foreground">
                    {avgRating ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · <span className="font-mono tabular-nums">{ratedBids.length}</span> reviews
                  </span>
                </div>
                <Badge tone="brand" size="sm">
                  <TrendingUp className="h-3 w-3" />
                  {MOCK_PROFILE_EXTRAS.areaRank}
                </Badge>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <BadgeCheck className="h-[15px] w-[15px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    Verified
                  </div>
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {(profile as any)?.has_insurance || (profile as any)?.has_license
                      ? 'Documents'
                      : 'Not yet'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Clock className="h-[15px] w-[15px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    Responds in
                  </div>
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {MOCK_PROFILE_EXTRAS.respondsIn}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-3.5 flex flex-col gap-2">
              {strength.checks.map(check => (
                <div key={check.key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-white',
                      check.done ? 'bg-primary' : 'border-[1.5px] border-gray-300 bg-white'
                    )}
                  >
                    {check.done && <Check className="h-[11px] w-[11px]" strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      'text-[13px]',
                      check.done ? 'text-muted-foreground line-through' : 'text-gray-700'
                    )}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/trades-crm/profile')}
            >
              Complete profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </SectionCard>

          {/* Today's schedule (mock) */}
          <SectionCard
            title="Today's schedule"
            subtitle={`${MOCK_SCHEDULE.length} appointments`}
            icon={CalendarClock}
            bodyClassName="py-1.5 px-0"
          >
            {MOCK_SCHEDULE.map((s, i) => (
              <div key={i} className="flex gap-3 px-5 py-2.5 transition-colors hover:bg-gray-50">
                <div className="w-11 shrink-0 text-right">
                  <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                    {s.time}
                  </div>
                  <div className="text-[10px] text-gray-400">{s.dur}</div>
                </div>
                <div className={cn('w-[3px] shrink-0 rounded-full', scheduleRail[s.tone])} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{s.title}</div>
                  <div className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-[11px] w-[11px]" />
                    {s.place}
                  </div>
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
