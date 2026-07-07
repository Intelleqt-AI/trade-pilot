import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchData, postData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { SectionLabel } from '@/components/trade-pilot/SectionLabel';
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { CreditUsageBarChart } from '@/components/trade-pilot/charts/CreditUsageBarChart';
import { CREDIT_PACKAGES } from '@/lib/creditPackages';
import { MOCK_CREDIT_USAGE } from '@/lib/designMockData';
import type { TradeCRMOutletContext } from '@/layouts/TradeCRMLayout';
import {
  ArrowDownLeft,
  BarChart3,
  Check,
  Coins,
  CreditCard,
  Download,
  Gavel,
  History,
  Loader2,
  PieChart,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  package_name: string;
  amount_total: string;
  currency: string;
  credits_added: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  last4: string;
  receipt_url: string;
  created_at: string;
}

interface BidCredit {
  id: string;
  job: string;
  job_title: string;
  job_category: string;
  job_trade: string;
  credits_spent: number;
  amount: string;
  outcome: 'won' | 'lost' | 'pending';
  created_at: string;
}

type LedgerEntry = {
  key: string;
  kind: 'purchase' | 'bid';
  date: Date;
  title: string;
  sub: string;
  credits: number; // positive = added, negative = spent
  amount: number;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger' | 'neutral';
  receiptUrl?: string;
};

const outcomeMeta: Record<string, { label: string; tone: 'success' | 'danger' | 'warning' }> = {
  won: { label: 'Won', tone: 'success' },
  lost: { label: 'Lost', tone: 'danger' },
  pending: { label: 'Pending', tone: 'warning' },
};

const txStatusMeta: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  completed: { label: 'Success', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
};

const SHARE_COLORS = ['bg-teal-500', 'bg-blue-500', 'bg-violet-500', 'bg-gray-400', 'bg-orange-500'];

const Credits = () => {
  const { user } = useAuth();
  const { jobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const [selectedPkg, setSelectedPkg] = useState(CREDIT_PACKAGES.find(p => p.popular)!.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  // TODO(backend): auto top-up is a local mock until the backend supports it
  const [autoTopUp, setAutoTopUp] = useState(() => localStorage.getItem('tp_auto_topup') === '1');

  const balance = jobMarketCredits ?? (user as any)?.credit_balance ?? 0;
  const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPkg)!;

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transaction-history'],
    queryFn: () => fetchData('/api/v1/payments/history/'),
  });

  const { data: bidCredits, isLoading: bidsLoading } = useQuery<BidCredit[]>({
    queryKey: ['credit-history'],
    queryFn: () => fetchData('/api/v1/tradepilot/jobs/credit-history/').then((res: any) => res?.data ?? res),
  });

  const handleAutoTopUp = (next: boolean) => {
    setAutoTopUp(next);
    localStorage.setItem('tp_auto_topup', next ? '1' : '0');
    toast(next ? 'Auto top-up enabled (saved on this device)' : 'Auto top-up disabled');
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const successUrl = `${window.location.origin}/trades-crm/credits/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/trades-crm/credits`;
      const response = await postData<{ url: string }>({
        url: '/api/v1/payments/create-checkout-session/',
        data: { package_id: pkg.id, success_url: successUrl, cancel_url: cancelUrl },
      });
      if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Failed to create payment session');
        setPaying(false);
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.response?.data?.error || 'Something went wrong');
      setPaying(false);
    }
  };

  /* ---------- derived analytics (real history, mock fallback) ---------- */

  const now = new Date();
  const last30 = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const spent30d = bidCredits?.length
    ? bidCredits
        .filter(b => new Date(b.created_at).getTime() >= last30)
        .reduce((s, b) => s + b.credits_spent, 0)
    : MOCK_CREDIT_USAGE.spent30d;
  const bought30d = transactions?.length
    ? transactions
        .filter(t => t.status === 'completed' && new Date(t.created_at).getTime() >= last30)
        .reduce((s, t) => s + t.credits_added, 0)
    : MOCK_CREDIT_USAGE.bought30d;

  const weeklySpend = spent30d / 4.3;
  const runwayWeeks = weeklySpend > 0 ? Math.round(balance / weeklySpend) : null;

  const { monthlySeries, monthLabels } = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('en-GB', { month: 'short' })[0] };
    });
    const hasReal = (bidCredits?.length ?? 0) > 0;
    const series = hasReal
      ? months.map(({ y, m }) =>
          bidCredits!
            .filter(b => {
              const d = new Date(b.created_at);
              return d.getFullYear() === y && d.getMonth() === m;
            })
            .reduce((s, b) => s + b.credits_spent, 0)
        )
      : MOCK_CREDIT_USAGE.monthlySpend;
    return { monthlySeries: series, monthLabels: months.map(m => m.label) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidCredits]);

  const byCategory = useMemo(() => {
    if (!bidCredits?.length) {
      return MOCK_CREDIT_USAGE.byCategory;
    }
    const groups = new Map<string, number>();
    bidCredits.forEach(b => {
      const key = (b.job_trade || 'Other').replace(/_/g, ' ');
      groups.set(key, (groups.get(key) ?? 0) + b.credits_spent);
    });
    return [...groups.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, credits], i) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        credits,
        colorClass: SHARE_COLORS[i % SHARE_COLORS.length],
      }));
  }, [bidCredits]);

  const totalByCategory = byCategory.reduce((s, c) => s + c.credits, 0);
  const totalSpentAll = bidCredits?.reduce((s, b) => s + b.credits_spent, 0) ?? 0;
  const wonCount = bidCredits?.filter(b => b.outcome === 'won').length ?? 0;
  const avgPerBid = bidCredits?.length
    ? Math.round(totalSpentAll / bidCredits.length)
    : MOCK_CREDIT_USAGE.avgPerBid;
  const costPerWin = wonCount > 0 ? Math.round(totalSpentAll / wonCount) : MOCK_CREDIT_USAGE.costPerWin;

  /* ---------- unified ledger ---------- */

  const ledger: LedgerEntry[] = useMemo(() => {
    const purchases: LedgerEntry[] = (transactions ?? []).map(tx => ({
      key: `p-${tx.id}`,
      kind: 'purchase',
      date: new Date(tx.created_at),
      title: tx.package_name || `${tx.credits_added} credits`,
      sub: tx.payment_method ? `${tx.payment_method} ···· ${tx.last4}` : 'Card payment',
      credits: tx.credits_added,
      amount: parseFloat(tx.amount_total),
      statusLabel: txStatusMeta[tx.status]?.label ?? tx.status,
      statusTone: txStatusMeta[tx.status]?.tone ?? 'neutral',
      receiptUrl: tx.receipt_url || undefined,
    }));
    const bids: LedgerEntry[] = (bidCredits ?? []).map(b => ({
      key: `b-${b.id}`,
      kind: 'bid',
      date: new Date(b.created_at),
      title: b.job_title || 'Bid placed',
      sub: [b.job_trade, b.job_category].filter(Boolean).join(' · ') || 'Job bid',
      credits: -b.credits_spent,
      amount: parseFloat(b.amount),
      statusLabel: outcomeMeta[b.outcome]?.label ?? b.outcome,
      statusTone: outcomeMeta[b.outcome]?.tone ?? 'neutral',
    }));
    return [...purchases, ...bids].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, bidCredits]);

  const filteredLedger = ledger.filter(e =>
    ledgerFilter === 'all' ? true : ledgerFilter === 'purchases' ? e.kind === 'purchase' : e.kind === 'bid'
  );
  const ledgerLoading = txLoading || bidsLoading;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Credits & billing"
        subtitle="Buy credits, track spending and manage your billing."
      >
        <Button variant="outline" onClick={() => toast('Billing settings are coming soon')}>
          <Settings className="h-4 w-4" />
          Billing settings
        </Button>
      </PageTitle>

      {/* Row 1: balance + buy credits */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1.35fr]">
        {/* Navy balance panel */}
        <div className="rounded-xl bg-navy-800 p-6 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-overline font-semibold uppercase text-white/55">Credit balance</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/30 text-teal-200">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[46px] font-semibold leading-none tabular-nums tracking-tight">
              {balance}
            </span>
            <span className="text-[13px] text-white/60">credits</span>
          </div>
          <div className="mt-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/25 px-2.5 py-1 text-xs font-medium text-teal-100">
              {runwayWeeks !== null && balance > 0 ? (
                <>
                  ≈ <span className="font-mono tabular-nums">{runwayWeeks}</span> weeks at your current pace
                </>
              ) : balance > 0 ? (
                'Ready to bid'
              ) : (
                'Top up to start bidding'
              )}
            </span>
          </div>
          <div className="my-5 h-px bg-white/10" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-white">Auto top-up</div>
              <div className="text-[11px] text-white/55">
                +50 credits when you drop below 20
              </div>
            </div>
            <Switch checked={autoTopUp} onCheckedChange={handleAutoTopUp} />
          </div>
        </div>

        {/* Buy credits */}
        <SectionCard title="Buy credits" subtitle="One-time packs · secure Stripe checkout" icon={CreditCard}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CREDIT_PACKAGES.map(p => {
              const selected = p.id === selectedPkg;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPkg(p.id)}
                  className={cn(
                    'relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
                    selected
                      ? 'border-primary bg-teal-50/60 shadow-xs'
                      : 'border-border bg-card hover:border-gray-300 hover:shadow-xs'
                  )}
                >
                  {p.popular && (
                    <span className="absolute right-0 top-0 rounded-bl-lg bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-white">
                      Best value
                    </span>
                  )}
                  <span
                    className={cn(
                      'mb-1 inline-flex h-8 w-8 items-center justify-center rounded-lg',
                      selected ? 'bg-teal-100 text-teal-700' : 'bg-gray-50 text-gray-500'
                    )}
                  >
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                  <span className="font-mono text-h2 font-semibold tabular-nums text-foreground">
                    {p.credits} <span className="text-xs font-medium text-muted-foreground">credits</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-semibold tabular-nums text-foreground">£{p.price}</span>{' '}
                    · <span className="font-mono tabular-nums">£{p.perCredit}</span>/cr
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Secure Stripe checkout · New balance:{' '}
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {balance + pkg.credits}
              </span>
            </div>
            <Button onClick={() => setConfirmOpen(true)}>
              Pay <span className="font-mono tabular-nums">£{pkg.price}</span>
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Row 2: usage analytics */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.35fr_1fr]">
        <SectionCard
          title="Credit usage"
          subtitle="Credits spent per month"
          icon={BarChart3}
          action={
            <div className="flex gap-4 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-[0.04em] text-muted-foreground">Spent 30d</div>
                <div className="font-mono text-sm font-semibold tabular-nums text-foreground">{spent30d}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.04em] text-muted-foreground">Bought 30d</div>
                <div className="font-mono text-sm font-semibold tabular-nums text-foreground">{bought30d}</div>
              </div>
            </div>
          }
        >
          <CreditUsageBarChart series={monthlySeries} labels={monthLabels} className="h-44 w-full" />
        </SectionCard>

        <SectionCard title="Where credits go" subtitle="By trade category" icon={PieChart}>
          {/* proportional share bar — flexGrow carries the live ratio */}
          <div className="mb-4 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            {byCategory.map(c => (
              <div
                key={c.label}
                className={cn('h-full min-w-[3px]', c.colorClass)}
                style={{ flexGrow: c.credits }}
              />
            ))}
          </div>
          <div className="space-y-2.5">
            {byCategory.map(c => (
              <div key={c.label} className="flex items-center gap-2.5">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', c.colorClass)} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">{c.label}</span>
                <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  {c.credits}
                </span>
                <span className="w-10 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {totalByCategory ? Math.round((c.credits / totalByCategory) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div>
              <div className="mb-0.5 text-xs text-muted-foreground">Avg. per bid</div>
              <div className="font-mono text-h3 font-semibold tabular-nums text-foreground">
                {avgPerBid} cr
              </div>
            </div>
            <div>
              <div className="mb-0.5 text-xs text-muted-foreground">Cost per win</div>
              <div className="font-mono text-h3 font-semibold tabular-nums text-foreground">
                {costPerWin} cr
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Transaction ledger */}
      <SectionCard
        title="Transaction history"
        subtitle="Purchases and bid spending in one place"
        icon={History}
        action={
          <SegmentedControl
            size="sm"
            value={ledgerFilter}
            onChange={setLedgerFilter}
            items={[
              { value: 'all', label: 'All' },
              { value: 'purchases', label: 'Purchases' },
              { value: 'bids', label: 'Bids' },
            ]}
          />
        }
        bodyClassName="p-0"
      >
        {ledgerLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredLedger.length === 0 ? (
          <EmptyState
            icon={History}
            title="No transactions yet"
            description="Credit purchases and bid spending will appear here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLedger.map(entry => (
              <div key={entry.key} className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-gray-50">
                <span
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    entry.kind === 'purchase' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {entry.kind === 'purchase' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <Gavel className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-foreground">{entry.title}</div>
                  <div className="truncate text-xs capitalize text-muted-foreground">{entry.sub}</div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-mono text-xs tabular-nums text-muted-foreground">
                    {entry.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="font-mono text-[10px] tabular-nums text-gray-400">
                    {entry.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right">
                  <span
                    className={cn(
                      'font-mono text-[13px] font-semibold tabular-nums',
                      entry.credits > 0 ? 'text-green-600' : 'text-foreground'
                    )}
                  >
                    {entry.credits > 0 ? '+' : ''}
                    {entry.credits}
                  </span>
                  <span className="ml-0.5 text-[10px] text-gray-400">cr</span>
                </div>
                <div className="hidden w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground md:block">
                  £{entry.amount.toFixed(entry.kind === 'purchase' ? 2 : 0)}
                </div>
                <div className="w-20 shrink-0 text-right">
                  <Badge tone={entry.statusTone} size="sm" dot>
                    {entry.statusLabel}
                  </Badge>
                </div>
                <div className="w-8 shrink-0 text-right">
                  {entry.receiptUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Download receipt"
                      onClick={() => window.open(entry.receiptUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Confirm purchase dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-700">{pkg.name} pack</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {pkg.credits} credits
              </span>
            </div>
            <div className="space-y-2 px-1 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per credit</span>
                <span className="font-mono tabular-nums text-foreground">£{pkg.perCredit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New balance</span>
                <span className="font-mono tabular-nums text-foreground">{balance + pkg.credits}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="font-mono tabular-nums text-foreground">£{pkg.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
              You'll be redirected to Stripe to complete payment securely.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={paying}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={paying}>
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Pay <span className="font-mono tabular-nums">£{pkg.price}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Credits;
