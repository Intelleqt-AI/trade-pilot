import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NotificationPanel from '@/components/Trade-CRM/NotificationPanel';
import { useAuth } from '@/hooks/useAuth';
import { fetchData } from '@/lib/api';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/trade-pilot/Logo';
import { SidebarItem } from '@/components/trade-pilot/SidebarItem';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Users,
  UserCircle,
  Coins,
  LifeBuoy,
  LogOut,
  CreditCard,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from 'lucide-react';

const MESSAGES_UNREAD_URL = '/api/v1/tradepilot/messaging/unread-count/';

const mainNavItems = [
  { path: '/trades-crm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trades-crm/job-market', label: 'Job Market', icon: Search },
  { path: '/trades-crm/jobs', label: 'My Jobs', icon: Briefcase },
  { path: '/trades-crm/leads', label: 'My Leads', icon: Users },
  { path: '/trades-crm/messages', label: 'Messages', icon: MessageSquare },
];

const secondaryNavItems = [
  { path: '/trades-crm/profile', label: 'My Profile', icon: UserCircle },
  { path: '/trades-crm/credits', label: 'Credits', icon: Coins },
  { path: '/trades-crm/support', label: 'Help Centre', icon: LifeBuoy },
];

const pageTitles: Record<string, string> = {
  '/trades-crm/dashboard': 'Dashboard',
  '/trades-crm/job-market': 'Job Market',
  '/trades-crm/jobs': 'My Jobs',
  '/trades-crm/leads': 'My Leads',
  '/trades-crm/messages': 'Messages',
  '/trades-crm/profile': 'My Profile',
  '/trades-crm/credits': 'Credits',
  '/trades-crm/credits/success': 'Credits',
  '/trades-crm/account-settings': 'Account settings',
  '/trades-crm/support': 'Help Centre',
};

export type TradeCRMOutletContext = {
  jobMarketCredits: number | null;
  setJobMarketCredits: (n: number) => void;
};

const TradeCRMLayout = () => {
  const { isAuthenticated, loading, isTrade, user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('tp_collapsed') === '1');
  const [jobMarketCredits, setJobMarketCredits] = useState<number | null>(null);

  const { data: msgUnread } = useQuery({
    queryKey: [MESSAGES_UNREAD_URL],
    queryFn: (): Promise<{ unread_count: number }> =>
      fetchData(MESSAGES_UNREAD_URL).then(
        (r: { data?: { unread_count: number } } & { unread_count?: number }) =>
          r?.data ?? (r as { unread_count: number }),
      ),
    refetchInterval: 60 * 1000,
    enabled: isAuthenticated && isTrade,
  });
  const messagesUnread: number = (msgUnread as { unread_count?: number } | undefined)?.unread_count ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isTrade) return <Navigate to="/dashboard" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleCollapsed = () => {
    setCollapsed(c => {
      localStorage.setItem('tp_collapsed', !c ? '1' : '0');
      return !c;
    });
  };

  const creditBalance =
    jobMarketCredits ?? (user as any)?.credit_balance ?? (profile as any)?.credit ?? 0;

  const businessName =
    (user as any)?.business_name || (user as any)?.company_name || user?.email || '';
  const fullName = [user?.first_name, (user as any)?.last_name].filter(Boolean).join(' ') || 'User';

  const sidebarInner = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col bg-navy-800">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center',
          isCollapsed ? 'justify-center px-0' : 'px-5'
        )}
      >
        <Logo collapsed={isCollapsed} onDark />
      </div>

      <nav className={cn('flex flex-1 flex-col gap-[3px] overflow-y-auto py-2', isCollapsed ? 'px-3' : 'px-3.5')}>
        {mainNavItems.map(item => (
          <SidebarItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            collapsed={isCollapsed}
            badge={
              item.path === '/trades-crm/messages' && messagesUnread > 0
                ? messagesUnread
                : undefined
            }
            onClick={() => setMobileSidebarOpen(false)}
          />
        ))}
        <div className={cn('my-2.5 h-px bg-white/10', isCollapsed ? 'mx-1' : 'mx-2')} />
        {secondaryNavItems.map(item => (
          <SidebarItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            collapsed={isCollapsed}
            onClick={() => setMobileSidebarOpen(false)}
          />
        ))}
      </nav>

      <div className={cn('shrink-0 border-t border-white/10', isCollapsed ? 'px-3 py-2.5' : 'px-3.5 py-3')}>
        {!isCollapsed && (
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate('/trades-crm/credits');
            }}
            className="mb-2.5 flex w-full items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
          >
            <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary/30 text-teal-200">
              <Coins className="h-[15px] w-[15px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-white/55">Credits</span>
              <span className="block font-mono text-sm font-semibold tabular-nums text-white">
                {creditBalance}
              </span>
            </span>
            <Plus className="h-[15px] w-[15px] text-white/60" />
          </button>
        )}
        <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
          <UserAvatar name={fullName} tone="brand" size="sm" verified />
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-white">{fullName}</div>
                <div className="truncate text-[11px] text-white/50">{businessName}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="inline-flex shrink-0 rounded p-1 text-white/55 transition-colors hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden overflow-hidden transition-all duration-300 lg:block',
          collapsed ? 'w-[72px]' : 'w-[264px]'
        )}
      >
        {sidebarInner(collapsed)}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] border-0 p-0 lg:hidden">
          {sidebarInner(false)}
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3.5">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-[18px] w-[18px]" />
              ) : (
                <PanelLeftClose className="h-[18px] w-[18px]" />
              )}
            </Button>
            <div>
              <div className="text-xs text-gray-400">TradePilot CRM</div>
              <div className="text-h3 font-semibold leading-tight text-foreground">{pageTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search jobs, leads…"
                className="h-10 w-60 rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-gray-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              />
            </div>
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => navigate('/trades-crm/credits')}
            >
              <CreditCard className="h-4 w-4" />
              Buy credits
            </Button>
            <NotificationPanel />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ jobMarketCredits, setJobMarketCredits } satisfies TradeCRMOutletContext} />
        </main>
      </div>
    </div>
  );
};

export default TradeCRMLayout;
