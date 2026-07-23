import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { Settings } from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <PageTitle title="Account settings" subtitle="Manage your account preferences." />
      <SectionCard bodyClassName="p-0">
        <EmptyState
          icon={Settings}
          title="Settings coming soon"
          description="Profile and business details can be edited from My Profile in the meantime."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/profile')}>
              Go to My Profile
            </Button>
          }
        />
      </SectionCard>
    </div>
  );
};

export default AccountSettings;
