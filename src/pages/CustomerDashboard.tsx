import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  PoundSterling, AlertTriangle, Hammer, Home, Check, ArrowRight,
  Bell, FileText, Loader2, Mail, Unlock, CheckCircle, AlertCircle, Clock, Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from 'recharts';
import { StatCard } from '@/components/trade-pilot/StatCard';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  fetchAnnualSpend, fetchAttention, fetchRecentActivity,
  fetchJobs, fetchProperties,
} from '@/lib/api/tpHomeowner';
import TPPostJobDialog from '@/components/homeowner/TPPostJobDialog';
import { ACTIVE_STATUSES } from '@/pages/homeowner/HomeImprovement';
import { countQuotes } from '@/lib/bids';
import type { ActivityItem } from '@/lib/activity';
import { readJobIntent, clearJobIntent, type JobIntent } from '@/lib/jobIntent';

const gbp = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Activity `type` → icon. Only the types a TradePilot homeowner can actually
// produce: documents, reminders and EPC are out of scope, so those source tables
// are always empty here. Anything unmapped falls back to Bell.
const ACTIVITY_ICON: Record<string, React.ElementType> = {
  new_quote: Mail,
  lead_purchased: Unlock,
  job_completed: CheckCircle,
  bid_accepted: CheckCircle,
  bid_rejected: AlertCircle,
  job_status: Clock,
  new_review: Star,
  trade_added: Hammer,
};

const activityTime = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true });
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [jobPrefill, setJobPrefill] = useState<JobIntent | null>(null);

  // Arriving from the marketing site's "Compare up to 3 quotes": open the job
  // form already filled in. Cleared immediately so a refresh doesn't reopen it.
  useEffect(() => {
    const intent = readJobIntent();
    if (!intent) return;
    clearJobIntent();
    setJobPrefill(intent);
    setPostJobOpen(true);
  }, []);

  const { data: annualSpend, isLoading: spendLoading } = useQuery({
    queryKey: ['ho-annual-spend'],
    queryFn: fetchAnnualSpend,
  });

  const { data: attention } = useQuery({
    queryKey: ['ho-attention'],
    queryFn: fetchAttention,
  });

  const { data: recent } = useQuery({
    queryKey: ['ho-recent-activity'],
    queryFn: () => fetchRecentActivity(6),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['ho-jobs'],
    queryFn: fetchJobs,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['ho-properties'],
    queryFn: fetchProperties,
  });

  const ytdSpend: number = (annualSpend as any)?.total ?? (annualSpend as any)?.ytd_total ?? 0;

  const monthlyData = useMemo(() => {
    const months = (annualSpend as any)?.months ?? (annualSpend as any)?.monthly ?? [];
    if (Array.isArray(months) && months.length) {
      return months.map((m: any, i: number) => ({
        month: m.month ?? m.label ?? MONTHS[i] ?? '',
        amount: Number(m.amount ?? m.total ?? 0),
      }));
    }
    return MONTHS.map(m => ({ month: m, amount: 0 }));
  }, [annualSpend]);

  const attentionItems: any[] = (attention as any)?.items ?? (Array.isArray(attention) ? attention : []);
  const recentItems: ActivityItem[] = recent ?? [];
  const jobList: any[] = Array.isArray(jobs) ? jobs : [];

  // A purchased-but-unquoted lead is interest, not a quote — see lib/bids.ts.
  const quotesIn = jobList.filter(j => countQuotes(j.bids ?? []) > 0).slice(0, 5);

  const hasProperty = (properties as any[]).length > 0;
  const hasJob = jobList.length > 0;
  const showGettingStarted = !hasProperty || !hasJob;

  const firstName = user?.first_name || 'there';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your home.
        </p>
      </div>

      {/* Getting started */}
      {showGettingStarted && (
        <SectionCard
          title="Get started"
          subtitle="A couple of quick steps to get the most out of TradePilot"
          icon={Home}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ChecklistItem
              done={hasProperty}
              label="Add your property"
              desc="So we can match you with local traders"
              onClick={() => navigate('/homeowner/settings?tab=properties')}
            />
            <ChecklistItem
              done={hasJob}
              label="Post your first job"
              desc="Get quotes from verified traders"
              onClick={() => setPostJobOpen(true)}
            />
          </div>
        </SectionCard>
      )}

      {/* Vitals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Home spend (YTD)"
          value={spendLoading ? '—' : gbp(ytdSpend)}
          sub="Across all completed jobs"
          icon={PoundSterling}
          tone="brand"
        />
        <StatCard
          label="Active jobs"
          value={jobList.filter(j => ACTIVE_STATUSES.includes(j.status)).length}
          sub="Currently open or in progress"
          icon={Hammer}
          tone="navy"
          onClick={() => navigate('/homeowner/improvements')}
        />
        <StatCard
          label="Quotes received"
          value={jobList.reduce((n, j) => n + countQuotes(j.bids ?? []), 0)}
          sub="Waiting for your review"
          icon={FileText}
          tone="accent"
          onClick={() => navigate('/homeowner/improvements')}
        />
      </div>

      {/* Needs attention */}
      {attentionItems.length > 0 && (
        <SectionCard title="Needs attention" icon={AlertTriangle} iconTone="accent">
          <div className="space-y-2.5">
            {attentionItems.slice(0, 5).map((item: any, i: number) => (
              <div
                key={item.id ?? i}
                className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3.5 dark:border-orange-500/25 dark:bg-orange-500/10"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title ?? item.label ?? 'Action needed'}
                  </p>
                  {(item.body ?? item.description) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.body ?? item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Annual spend tracker */}
      <SectionCard
        title="Annual spend tracker"
        subtitle="What you've spent on your home this year"
        icon={PoundSterling}
      >
        {ytdSpend === 0 ? (
          <EmptyState
            icon={PoundSterling}
            title="No spend recorded yet"
            description="Once you complete a job, your spend will show up here."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickFormatter={(v: number) => (v ? `£${v}` : '0')}
                  className="text-muted-foreground"
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  formatter={(v: number) => [gbp(v), 'Spend']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recent activity"
          icon={Bell}
          action={
            <Link
              to="/homeowner/notifications"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          {recentItems.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Your activity will appear here"
              description="Updates about your jobs and quotes will show up in this list."
            />
          ) : (
            <div className="space-y-3">
              {recentItems.slice(0, 6).map(item => {
                const Icon = ACTIVITY_ICON[item.type] ?? Bell;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        item.good
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-foreground">
                        {item.text}
                      </p>
                      {item.sub && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {item.sub}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {activityTime(item.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Quotes in"
          subtitle="Jobs with quotes waiting for you"
          icon={FileText}
          iconTone="navy"
          action={
            <Link
              to="/homeowner/improvements"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          {quotesIn.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No quotes yet"
              description="Post a job and verified traders will send you quotes."
              action={
                <Button size="sm" onClick={() => setPostJobOpen(true)}>
                  <Hammer className="mr-1.5 h-4 w-4" />
                  Post a job
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {quotesIn.map((j: any) => (
                <Link
                  key={j.id}
                  to="/homeowner/improvements"
                  className="flex items-center gap-3 rounded-lg border p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Hammer className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{j.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {countQuotes(j.bids ?? [])} quote
                      {countQuotes(j.bids ?? []) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <TPPostJobDialog
        open={postJobOpen}
        onOpenChange={setPostJobOpen}
        prefill={jobPrefill ?? undefined}
      />
    </div>
  );
};

const ChecklistItem = ({
  done, label, desc, onClick,
}: { done: boolean; label: string; desc: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={done ? undefined : onClick}
    disabled={done}
    className={cn(
      'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
      done
        ? 'border-primary/30 bg-primary/5'
        : 'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm'
    )}
  >
    <span
      className={cn(
        'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
        done ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'
      )}
    >
      {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
    <div className="min-w-0">
      <p className={cn('text-sm font-semibold', done ? 'text-primary' : 'text-foreground')}>
        {label}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
    </div>
  </button>
);

export default CustomerDashboard;
