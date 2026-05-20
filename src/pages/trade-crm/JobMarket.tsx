import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HomePlusJobsFeed from '@/components/Trade-CRM/HomePlusJobsFeed';
import type { TradeCRMOutletContext } from '@/layouts/TradeCRMLayout';

const JobMarket = () => {
  const { user, profile } = useAuth();
  const { jobMarketCredits, setJobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const creditBalance =
    jobMarketCredits ?? (user as any)?.credit_balance ?? profile?.credit ?? 0;

  return (
    <HomePlusJobsFeed
      creditBalance={creditBalance}
      onCreditChange={setJobMarketCredits}
    />
  );
};

export default JobMarket;
