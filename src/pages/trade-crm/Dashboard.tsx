import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBids, fetchData, fetchTradeDocuments, fetchTradeServices } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/trade-pilot/StatCard';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { SectionLabel } from '@/components/trade-pilot/SectionLabel';
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { ProgressRing } from '@/components/trade-pilot/ProgressRing';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { RevenueAreaChart } from '@/components/trade-pilot/charts/RevenueAreaChart';
import { profileStrength } from '@/lib/profileStrength';
import {
  MOCK_PROFILE_EXTRAS,
  deriveCompetition,
} from '@/lib/designMockData';

type RevenuePeriod = '7d' | '1m' | '3m' | '1yr';
const REVENUE_PERIOD_SUB: Record<RevenuePeriod, string> = {
  '7d': 'last 7 days',
  '1m': 'last 30 days',
  '3m': 'last 3 months',
  '1yr': 'last 12 months',
};
import { toneDot, urgencyBadgeTone, urgencyLabel } from '@/components/trade-pilot/tones';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Coins,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const { user, profile } = useAuth();
  const [period, setPeriod] = useState<RevenuePeriod>('1m');

  const { data: jobFeedData } = useQuery({
    queryKey: ['JobFeed'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/'),
  });

  const { data: myBidsData } = useQuery({ queryKey: ['MyBids'], queryFn: fetchMyBids });

  const { data: documents = [] } = useQuery({
    queryKey: ['tradeDocuments'],
    queryFn: fetchTradeDocuments,
    // Reflect uploads made on the Profile page as soon as the Dashboard mounts
    // (the global default is refetchOnMount: false).
    refetchOnMount: 'always',
  });

  const { data: services = [] } = useQuery({
    queryKey: ['tradeServices'],
    queryFn: fetchTradeServices,
    refetchOnMount: 'always',
  });

  const { data: creditUsage } = useQuery({
    queryKey: ['DashCreditUsage'],
    queryFn: () =>
      fetchData<any>('/api/v1/tradepilot/jobs/dashboard/credit-usage/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });

  // Dashboard KPIs — real, server-cached endpoints. refetchOnMount:'always' so
  // returning to the dashboard reflects freshly-invalidated values (the server
  // cache keeps recomputation cheap).
  const { data: dashEarnings } = useQuery({
    queryKey: ['DashEarnings'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/dashboard/earnings/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });
  const { data: dashJobsWon } = useQuery({
    queryKey: ['DashJobsWon'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/dashboard/jobs-won/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });
  const { data: dashWinRate } = useQuery({
    queryKey: ['DashWinRate'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/dashboard/win-rate/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });
  const { data: dashJobsNear } = useQuery({
    queryKey: ['DashJobsNear'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/dashboard/jobs-near-you/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });
  const { data: revenue } = useQuery({
    queryKey: ['DashRevenue', period],
    queryFn: () =>
      fetchData<any>(`/api/v1/tradepilot/jobs/dashboard/revenue/?period=${period}`).then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });
  const { data: dashSchedule } = useQuery({
    queryKey: ['DashSchedule'],
    queryFn: () => fetchData<any>('/api/v1/tradepilot/jobs/dashboard/today/').then(r => r?.data ?? r),
    refetchOnMount: 'always',
  });

  const creditBalance =
    jobMarketCredits ?? (user as any)?.credit_balance ?? (profile as any)?.credit ?? 0;

  const feedJobs: any[] = Array.isArray(jobFeedData)
    ? jobFeedData
    : jobFeedData?.data ?? jobFeedData?.results ?? [];
  const myBids: any[] = Array.isArray(myBidsData) ? myBidsData : [];

  const now = new Date();

  // KPI values from the server-cached dashboard endpoints
  const earningsAmount = Number(dashEarnings?.amount ?? 0);
  const jobsWon = Number(dashJobsWon?.count ?? 0);
  const winRate = Number(dashWinRate?.rate ?? 0);
  const bidsPlaced = Number(dashWinRate?.total ?? 0);
  const jobsNearCount = Number(dashJobsNear?.count ?? 0);

  // Revenue card (real, server-cached per period)
  const revenuePoints: { label: string; value: number }[] = revenue?.points ?? [];
  const revenueTotal = Number(revenue?.total ?? 0);
  const revenueFooter = [
    { label: 'Bids placed', value: String(revenue?.bids_placed ?? 0) },
    { label: 'Avg job value', value: `£${Number(revenue?.avg_job_value ?? 0).toLocaleString('en-GB')}` },
    { label: 'Repeat customers', value: `${Number(revenue?.repeat_customers ?? 0)}%` },
  ];

  // Today's schedule (real: accepted jobs due today, with distance)
  const scheduleItems: { id: string; title: string; customer: string; location: string; distance_km: number | null }[] =
    dashSchedule?.items ?? [];

  // Ratings for the Profile-strength card (real, from my-bids)
  const acceptedBids = myBids.filter(b => b.status === 'accepted');
  const ratedBids = acceptedBids.filter(b => b.rating != null);
  const avgRating = ratedBids.length
    ? (ratedBids.reduce((s, b) => s + Number(b.rating), 0) / ratedBids.length).toFixed(1)
    : null;

  // Credits spent / bought over the last 30 days (real history, mock fallback)
  const spent30d = Number(creditUsage?.spent_30d ?? 0);
  const bought30d = Number(creditUsage?.bought_30d ?? 0);
  const spendRatio =
    spent30d + creditBalance > 0
      ? Math.min(100, Math.round((spent30d / (spent30d + creditBalance)) * 100))
      : 0;

  const radiusKm = (profile as any)?.radius_km ?? (profile as any)?.radius ?? 25;
  const hasUploadedDoc = (documents as any[]).length > 0;
  const hasVerifiedDoc = (documents as any[]).some(d => d.is_verified);
  const hasService = (services as any[]).length > 0;
  const strength = profileStrength(profile, creditBalance, {
    hasService,
    hasCertificationDoc: hasUploadedDoc,
  });

  const rankedJobs = [...feedJobs]
    .sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
    .slice(0, 5)
    .map(job => ({ job }));

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
          <Button onClick={() => navigate('/trades-crm/job-market')}>
            <Search className="h-4 w-4" />
            Browse jobs
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Earnings · last 30 days"
          value={`£${earningsAmount.toLocaleString('en-GB')}`}
          sub="completed jobs"
          icon={Wallet}
          tone="brand"
        />
        <StatCard
          label="Jobs won"
          value={String(jobsWon)}
          sub="all-time"
          icon={Trophy}
          tone="success"
        />
        <StatCard
          label="Win rate"
          value={`${winRate}%`}
          sub={`${bidsPlaced} bids placed`}
          icon={Target}
          tone="violet"
        />
        <StatCard
          label="Jobs near you"
          value={String(jobsNearCount)}
          sub={`within ${dashJobsNear?.radius_km ?? radiusKm} km`}
          icon={MapPin}
          tone="accent"
          badge={
            jobsNearCount > 0 ? (
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
            subtitle={`${feedJobs.length} live · nearest first`}
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
              rankedJobs.map(({ job }, i) => {
                const comp = deriveCompetition(job.bids_count);
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate('/trades-crm/job-market')}
                    className={cn(
                      'flex cursor-pointer items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-gray-50',
                      i > 0 && 'border-t border-gray-100'
                    )}
                  >
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
                    £{revenueTotal.toLocaleString('en-GB')}
                  </span>
                  <span className="text-xs text-muted-foreground">{REVENUE_PERIOD_SUB[period]}</span>
                </div>
              </div>
              <SegmentedControl
                size="sm"
                value={period}
                onChange={v => setPeriod(v as RevenuePeriod)}
                items={[
                  { value: '7d', label: '7d' },
                  { value: '1m', label: '1m' },
                  { value: '3m', label: '3m' },
                  { value: '1yr', label: '1yr' },
                ]}
              />
            </div>
            <RevenueAreaChart
              series={revenuePoints.map(p => p.value)}
              labels={revenuePoints.map(p => p.label)}
              className="h-40 w-full"
            />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              {revenueFooter.map(stat => (
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
            <div className="mb-4">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <span
                  className={cn(
                    'inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg',
                    hasVerifiedDoc
                      ? 'bg-green-50 text-green-600'
                      : hasUploadedDoc
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-400'
                  )}
                >
                  <BadgeCheck className="h-[15px] w-[15px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    Documents
                  </div>
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {hasVerifiedDoc ? 'Verified' : hasUploadedDoc ? 'Pending review' : 'Not added'}
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

          {/* Today's schedule — accepted jobs due today, with distance */}
          <SectionCard
            title="Today's schedule"
            subtitle={`${scheduleItems.length} job${scheduleItems.length === 1 ? '' : 's'} today`}
            icon={CalendarClock}
            bodyClassName="py-1.5 px-0"
          >
            {scheduleItems.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled for today"
                description="Jobs you've won with today's date will appear here."
              />
            ) : (
              scheduleItems.map(item => (
                <div key={item.id} className="flex gap-3 px-5 py-2.5 transition-colors hover:bg-gray-50">
                  <div className="w-14 shrink-0 text-right">
                    <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                      {item.distance_km != null ? item.distance_km : '—'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {item.distance_km != null ? 'km away' : ''}
                    </div>
                  </div>
                  <div className="w-[3px] shrink-0 rounded-full bg-teal-500" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {item.title}
                      {item.customer ? ` — ${item.customer}` : ''}
                    </div>
                    {item.location && (
                      <div className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-[11px] w-[11px]" />
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
