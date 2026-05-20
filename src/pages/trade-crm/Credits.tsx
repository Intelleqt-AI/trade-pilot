import CreditRecharge from '@/components/Trade-CRM/CreditRecharge';
import TransactionHistory from '@/components/Trade-CRM/TransactionHistory';

const Credits = () => {
  return (
    <div className="container mx-auto py-6 px-4 space-y-12">
      <CreditRecharge />
      
      <div className="pt-8 border-t border-slate-100">
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Credits;
