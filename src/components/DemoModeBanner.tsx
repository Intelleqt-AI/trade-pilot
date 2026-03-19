import { isDemoMode, DEMO_CREDENTIALS } from '@/lib/mockData';
import { AlertCircle } from 'lucide-react';

export const DemoModeBanner = () => {
  if (!isDemoMode()) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
      <AlertCircle className="inline-block w-4 h-4 mr-2 -mt-0.5" />
      <span>
        Demo Mode Active — Login as{' '}
        <strong>{DEMO_CREDENTIALS.customer.email}</strong> or{' '}
        <strong>{DEMO_CREDENTIALS.trade.email}</strong> with password:{' '}
        <strong>{DEMO_CREDENTIALS.customer.password}</strong>
      </span>
    </div>
  );
};
