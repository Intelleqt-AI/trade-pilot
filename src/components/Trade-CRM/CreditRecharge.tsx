import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/apiClient';
import { postData } from '@/lib/api';
import { toast } from 'sonner';

const CREDIT_PACKAGES = [
  {
    id: 'pkg_10',
    name: 'Starter Pack',
    credits: 10,
    price: 10,
    description: 'Perfect for small jobs and getting started.',
    features: ['10 Job Credits', 'Basic Support', 'Instant Activation'],
    icon: Coins,
    color: 'blue'
  },
  {
    id: 'pkg_50',
    name: 'Professional',
    credits: 50,
    price: 45,
    description: 'Best for active trades seeking regular work.',
    features: ['50 Job Credits', 'Priority Leads', 'Email Support', 'Save 10%'],
    icon: Zap,
    popular: true,
    color: 'indigo'
  },
  {
    id: 'pkg_100',
    name: 'Business Elite',
    credits: 100,
    price: 80,
    description: 'Maximum value for busy companies.',
    features: ['100 Job Credits', 'Premium Placement', '24/7 Support', 'Save 20%'],
    icon: Sparkles,
    color: 'purple'
  }
];

const CreditRecharge = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuyCredits = async (packageId: string) => {
    setLoading(packageId);
    try {
      const successUrl = `${window.location.origin}/trades-crm/credits/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/trades-crm/credits`;

      const response = await postData<{ url: string }>({
        url: '/api/v1/payments/create-checkout-session/',
        data: { 
          package_id: packageId,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      });
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const balance = user?.credit_balance ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Credits</h1>
          <p className="text-slate-500 mt-1">Purchase credits to unlock job leads and grow your business.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative z-10">
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Balance</p>
            <p className="text-2xl font-black text-slate-900">{balance} <span className="text-xs font-medium text-slate-400 uppercase">Credits</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative overflow-hidden flex flex-col border-2 transition-all duration-300 hover:shadow-lg ${
              pkg.popular ? 'border-primary shadow-md scale-105 z-10' : 'border-slate-100 shadow-sm'
            }`}
          >
            {pkg.popular && (
              <div className="bg-primary text-white text-center py-1 text-[10px] font-bold uppercase tracking-widest absolute top-0 left-0 right-0">
                Most Popular
              </div>
            )}

            <CardHeader className={pkg.popular ? 'pt-8' : 'pt-6'}>
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                pkg.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                pkg.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                'bg-purple-50 text-purple-600'
              }`}>
                <pkg.icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
              <CardDescription className="text-slate-500 text-sm min-h-[40px]">{pkg.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">£{pkg.price}</span>
                <span className="text-slate-400 text-xs font-medium uppercase">One-time</span>
              </div>

              <div className="space-y-2.5">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pb-6">
              <Button 
                className={`w-full py-5 rounded-lg font-bold transition-all ${
                  pkg.popular 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-md' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                onClick={() => handleBuyCredits(pkg.id)}
                disabled={loading !== null}
              >
                {loading === pkg.id ? 'Processing...' : `Buy ${pkg.credits} Credits`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Secure Payments</h3>
            <p className="text-slate-500 text-xs">All transactions are encrypted and processed by Stripe.</p>
          </div>
        </div>
        <div className="flex gap-2 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="h-6 w-10 bg-slate-300 rounded"></div>
           <div className="h-6 w-10 bg-slate-300 rounded"></div>
           <div className="h-6 w-10 bg-slate-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CreditRecharge;
