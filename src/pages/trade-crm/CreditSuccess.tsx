import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ME_URL } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

const MAX_ATTEMPTS = 8;
const INTERVAL_MS = 2000;

const CreditSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'done' | 'timeout'>('verifying');

  // Baseline balance captured once on mount — the webhook grant is detected as an increase.
  const baselineRef = useRef<number | null>(
    typeof (user as any)?.credit_balance === 'number' ? (user as any).credit_balance : null,
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus('done');
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      await queryClient.invalidateQueries({ queryKey: [ME_URL] });
      await queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      if (cancelled) return;

      const me: any = queryClient.getQueryData([ME_URL]);
      const current: number | null = me?.data?.credit_balance ?? null;
      const increased =
        baselineRef.current == null ? current != null : (current ?? 0) > baselineRef.current;

      if (increased) {
        setStatus('done');
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('timeout');
        return;
      }
      setTimeout(poll, INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, queryClient]);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>

        <h1 className="mb-2 text-h2 font-semibold text-foreground">Payment successful</h1>
        <p className="mx-auto mb-6 max-w-sm text-[13px] text-muted-foreground">
          {status === 'timeout'
            ? 'Your payment succeeded. Your balance may take a moment to update — it will appear shortly.'
            : 'Your credits have been added to your account. You can now start bidding on jobs.'}
        </p>

        {typeof (user as any)?.credit_balance === 'number' && (
          <div className="mb-6 rounded-lg bg-muted px-4 py-3">
            <div className="text-overline font-semibold uppercase text-muted-foreground">New balance</div>
            <div className="font-mono text-display font-semibold tabular-nums text-foreground">
              {(user as any).credit_balance}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <Button className="w-full" onClick={() => navigate('/trades-crm/job-market')}>
            Go to Job Market
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/trades-crm/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {status === 'verifying' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating your balance…
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditSuccess;
