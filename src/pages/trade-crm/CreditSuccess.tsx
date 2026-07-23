import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

const CreditSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const complete = async () => {
      if (sessionId) {
        // Wait a bit for the webhook to process
        await new Promise(r => setTimeout(r, 2000));
        // Invalidate the 'me' query to fetch fresh credit balance
        queryClient.invalidateQueries({ queryKey: ['/api/v1/tradepilot/auth/me/'] });
        setVerifying(false);
      }
    };
    complete();
  }, [sessionId, queryClient]);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>

        <h1 className="mb-2 text-h2 font-semibold text-foreground">Payment successful</h1>
        <p className="mx-auto mb-6 max-w-sm text-[13px] text-muted-foreground">
          Your credits have been added to your account. You can now start bidding on jobs.
        </p>

        {typeof (user as any)?.credit_balance === 'number' && (
          <div className="mb-6 rounded-lg bg-gray-50 px-4 py-3">
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

        {verifying && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating your balance…
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditSuccess;
