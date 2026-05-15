import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Users,
  FileText,
  Coins,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  CreditCard,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '@/lib/api';

const mainNavItems = [
  { path: '/trades-crm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trades-crm/job-market', label: 'Job Market', icon: Search },
  { path: '/trades-crm/jobs', label: 'My Jobs', icon: Briefcase },
  { path: '/trades-crm/leads', label: 'My Leads', icon: Users },
];

const secondaryNavItems = [
  { path: '/trades-crm/profile', label: 'My Profile', icon: FileText },
  { path: '/trades-crm/credits', label: 'Credits', icon: Coins },
  // { path: '/trades-crm/profile', label: 'Settings', icon: Settings },
  { path: '/trades-crm/support', label: 'Help Centre', icon: HelpCircle },
];

export type TradeCRMOutletContext = {
  jobMarketCredits: number | null;
  setJobMarketCredits: (n: number) => void;
};

const TradeCRMLayout = () => {
  const { isAuthenticated, loading, isTrade, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [jobMarketCredits, setJobMarketCredits] = useState<number | null>(null);

  const { data: jobsData } = useQuery({ queryKey: ['Jobs'], queryFn: fetchJobs });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTrade) return <Navigate to="/dashboard" replace />;

  const pendingCount = (jobsData as any[])?.filter(job => job.status !== 'complete').length ?? 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-secondary tracking-tight">Trade </span>
            <span className="relative">
              <span
                className="text-accent absolute -top-2.5 left-0 text-xs font-bold"
                style={{ transform: 'rotate(-15deg)' }}
              >
                ✓
              </span>
              <span className="text-xl font-bold text-secondary tracking-tight">Pilot</span>
            </span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md hover:bg-slate-100"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-slate-200" />

          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex-1" />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 -ml-1"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center hidden sm:flex">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Welcome back</p>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">{user?.first_name || 'User'}</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="hidden md:inline-flex border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold px-5 py-2"
                onClick={() => navigate('/trades-crm/leads')}
              >
                View Leads
              </Button>
              <Button
                className="hidden md:inline-flex bg-secondary hover:bg-secondary/90 text-white font-semibold px-5 py-2 shadow-md"
                onClick={() => navigate('/trades-crm/credits')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-slate-300"
                onClick={() => navigate('/trades-crm/leads')}
              >
                <Users className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-slate-300"
                onClick={() => navigate('/trades-crm/credits')}
              >
                <CreditCard className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="relative border-slate-300">
                <Bell className="h-4 w-4 text-slate-600" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-300 hidden sm:inline-flex"
                onClick={() => navigate('/trades-crm/profile')}
              >
                <Settings className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ jobMarketCredits, setJobMarketCredits } satisfies TradeCRMOutletContext} />
        </div>
      </main>
    </div>
  );
};

export default TradeCRMLayout;
