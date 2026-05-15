import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="container mx-auto max-w-2xl py-12 px-4 animate-in zoom-in-95 duration-500">
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
        <CardContent className="pt-16 pb-12 px-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-emerald-50 p-6 rounded-full relative">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-slate-500 text-base mb-10 max-w-sm mx-auto">
            Your credits have been added to your account. You can now start purchasing job leads.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/trades-crm/job-market')}
              className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg group"
            >
              Go to Job Market
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate('/trades-crm/dashboard')}
              className="w-full py-6 rounded-xl text-slate-500 font-semibold hover:bg-slate-50"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {verifying && (
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating your balance...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSuccess;
