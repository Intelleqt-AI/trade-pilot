import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HomePlusJobsFeed from '@/components/Trade-CRM/HomePlusJobsFeed';
import type { TradeCRMOutletContext } from '@/layouts/TradeCRMLayout';

const JobMarket = () => {
  const { user, profile } = useAuth();
  const { jobMarketCredits, setJobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  // `credit_balance` is the real serializer field; the old `profile.credit`
  // fallback never fired because that key does not exist.
  const creditBalance = jobMarketCredits ?? user?.credit_balance ?? 0;

  return (
    <HomePlusJobsFeed
      creditBalance={creditBalance}
      onCreditChange={setJobMarketCredits}
    />
  );
};

export default JobMarket;
