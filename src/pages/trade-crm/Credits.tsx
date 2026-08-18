import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchData, postData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useCreditProducts } from '@/hooks/useCreditProducts';
import { formatMoney, formatPerCredit, formatMajor } from '@/lib/format';
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
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  package_name?: string;
  amount_total: string;
  currency: string;
  credits_added: number;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'refunded';
  payment_method: string;
  last4: string;
  receipt_url: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
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
  currency: string;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger' | 'neutral';
  invoiceUrl?: string;
  invoicePdf?: string;
  receiptUrl?: string;
};

const outcomeMeta: Record<string, { label: string; tone: 'success' | 'danger' | 'warning' }> = {
  won: { label: 'Won', tone: 'success' },
  lost: { label: 'Lost', tone: 'danger' },
  pending: { label: 'Pending', tone: 'warning' },
};

const txStatusMeta: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  completed: { label: 'Success', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
  expired: { label: 'Expired', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

const SHARE_COLORS = ['bg-teal-500', 'bg-blue-500', 'bg-violet-500', 'bg-gray-400', 'bg-orange-500'];

const Credits = () => {
  const { user } = useAuth();
  const { jobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState('all');

  const balance = jobMarketCredits ?? (user as any)?.credit_balance ?? 0;

  const { data: products, isLoading: productsLoading, isError: productsError } = useCreditProducts();

  // Data-driven default: Stripe metadata.popular, else best per-credit value.
  // Resolved via `??` (no useEffect) so no flash / extra render when products arrive.
  const popularPriceId = useMemo(() => {
    if (!products?.length) return null;
    const flagged = products.find(p => p.metadata?.popular === 'true');
    if (flagged) return flagged.price_id;
    return products.reduce((best, p) =>
      p.unit_amount / p.credits < best.unit_amount / best.credits ? p : best
    ).price_id;
  }, [products]);

  const activePriceId = selectedPriceId ?? popularPriceId;
  const selectedProduct = products?.find(p => p.price_id === activePriceId) ?? null;

  // One-shot notice when returning from a cancelled Stripe checkout.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('canceled')) {
      toast('Checkout canceled — no charge was made.');
      searchParams.delete('canceled');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transaction-history'],
    queryFn: () => fetchData('/api/v1/payments/history/'),
  });

  const { data: bidCredits, isLoading: bidsLoading } = useQuery<BidCredit[]>({
    queryKey: ['credit-history'],
    queryFn: () => fetchData('/api/v1/tradepilot/jobs/credit-history/').then((res: any) => res?.data ?? res),
  });

  const handlePay = async () => {
    if (!selectedProduct) {
      toast.error('Please select a package');
      return;
    }
    setPaying(true);
    try {
      // Send only price_id — backend owns redirect URLs, amount and credits.
      const response = await postData<{ url: string }>({
        url: '/api/v1/payments/create-checkout-session/',
        data: { price_id: selectedProduct.price_id },
      });
      if (response?.url) {
        window.location.href = response.url; // hosted Stripe checkout
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

  /* ---------- credit-usage analytics (real, server-cached) ---------- */

  const { data: creditUsage } = useQuery<any>({
    queryKey: ['DashCreditUsage'],
    queryFn: () =>
      fetchData<any>('/api/v1/tradepilot/jobs/dashboard/credit-usage/').then((r: any) => r?.data ?? r),
    refetchOnMount: 'always',
  });

  const spent30d = Number(creditUsage?.spent_30d ?? 0);
  const bought30d = Number(creditUsage?.bought_30d ?? 0);
  const weeklySpend = spent30d / 4.3;
  const runwayWeeks = weeklySpend > 0 ? Math.round(balance / weeklySpend) : null;

  const monthlySeries: number[] = creditUsage?.monthly_spend ?? [];
  const monthLabels: string[] = creditUsage?.month_labels ?? [];

  const byCategory = ((creditUsage?.by_category ?? []) as { label: string; credits: number }[]).map(
    (c, i) => ({ label: c.label, credits: c.credits, colorClass: SHARE_COLORS[i % SHARE_COLORS.length] })
  );
  const totalByCategory = byCategory.reduce((s, c) => s + c.credits, 0);
  const avgPerBid = Number(creditUsage?.avg_per_bid ?? 0);
  const costPerWin = Number(creditUsage?.cost_per_win ?? 0);

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
      currency: tx.currency || 'gbp',
      statusLabel: txStatusMeta[tx.status]?.label ?? tx.status,
      statusTone: txStatusMeta[tx.status]?.tone ?? 'neutral',
      invoiceUrl: tx.hosted_invoice_url || undefined,
      invoicePdf: tx.invoice_pdf || undefined,
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
      currency: 'gbp',
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
      />

      {/* Row 1: balance + buy credits */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.35fr]">
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
        </div>

        {/* Buy credits */}
        <SectionCard title="Buy credits" subtitle="One-time packs · secure Stripe checkout" icon={CreditCard}>
          {productsError ? (
            <div className="p-4 text-sm text-muted-foreground">
              Couldn't load packages. Please refresh or try again shortly.
            </div>
          ) : productsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[132px] w-full rounded-xl" />
              ))}
            </div>
          ) : !products?.length ? (
            <EmptyState
              icon={Coins}
              title="No packages available"
              description="Credit packages aren't available right now — please contact support."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {products.map(p => {
                  const selected = p.price_id === activePriceId;
                  const isPopular = p.price_id === popularPriceId;
                  return (
                    <button
                      key={p.price_id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedPriceId(p.price_id)}
                      className={cn(
                        'relative flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
                        selected
                          ? 'border-primary bg-teal-50/60 shadow-xs dark:bg-teal-500/10'
                          : 'border-border bg-card hover:border-input hover:shadow-xs'
                      )}
                    >
                      {isPopular && (
                        <span className="absolute right-0 top-0 rounded-bl-lg bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-white">
                          Best value
                        </span>
                      )}
                      <span
                        className={cn(
                          'mb-1 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg',
                          selected ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Coins className="h-4 w-4" />
                        )}
                      </span>
                      <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                      <span className="font-mono text-h2 font-semibold tabular-nums text-foreground">
                        {p.credits} <span className="text-xs font-medium text-muted-foreground">credits</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-mono font-semibold tabular-nums text-foreground">
                          {formatMoney(p.unit_amount, p.currency)}
                        </span>{' '}
                        · <span className="font-mono tabular-nums">{formatPerCredit(p.unit_amount, p.credits, p.currency)}</span>/cr
                      </span>
                      {p.description && (
                        <span className="line-clamp-2 text-[11px] text-muted-foreground">{p.description}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="h-4 w-4 text-teal-600" />
                  After Payment New Balance:{' '}
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {balance + (selectedProduct?.credits ?? 0)}
                  </span>
                </div>
                <Button onClick={() => setConfirmOpen(true)} disabled={!selectedProduct}>
                  Pay {selectedProduct ? formatMoney(selectedProduct.unit_amount, selectedProduct.currency) : ''}
                </Button>
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Row 2: usage analytics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
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
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{c.label}</span>
                <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  {c.credits}
                </span>
                <span className="w-10 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {totalByCategory ? Math.round((c.credits / totalByCategory) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
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
          <div className="divide-y divide-border">
            {filteredLedger.map(entry => (
              <div key={entry.key} className="flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-muted">
                <span
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    entry.kind === 'purchase' ? 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400' : 'bg-muted text-muted-foreground'
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
                  <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
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
                  <span className="ml-0.5 text-[10px] text-muted-foreground">cr</span>
                </div>
                <div className="hidden w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground md:block">
                  {formatMajor(entry.amount, entry.currency)}
                </div>
                <div className="w-20 shrink-0 text-right">
                  <Badge tone={entry.statusTone} size="sm" dot>
                    {entry.statusLabel}
                  </Badge>
                </div>
                <div className="w-8 shrink-0 text-right">
                  {(() => {
                    const docUrl = entry.invoiceUrl || entry.invoicePdf || entry.receiptUrl;
                    if (!docUrl) return null;
                    const isInvoice = Boolean(entry.invoiceUrl || entry.invoicePdf);
                    const label = isInvoice ? 'Download invoice' : 'Download receipt';
                    return (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={label}
                        aria-label={label}
                        onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    );
                  })()}
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
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-foreground">{selectedProduct?.name} pack</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {selectedProduct?.credits} credits
              </span>
            </div>
            <div className="space-y-2 px-1 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per credit</span>
                <span className="font-mono tabular-nums text-foreground">
                  {selectedProduct && formatPerCredit(selectedProduct.unit_amount, selectedProduct.credits, selectedProduct.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New balance</span>
                <span className="font-mono tabular-nums text-foreground">{balance + (selectedProduct?.credits ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="font-mono tabular-nums text-foreground">
                  {selectedProduct && formatMoney(selectedProduct.unit_amount, selectedProduct.currency)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
              You'll be redirected to Stripe to complete payment securely.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={paying}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={paying || !selectedProduct}>
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Pay {selectedProduct && formatMoney(selectedProduct.unit_amount, selectedProduct.currency)}
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
