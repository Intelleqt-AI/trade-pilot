import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, ME_URL } from '@/hooks/useAuth';
import { fetchUnreadCount, fetchNotifications } from '@/lib/api/tpHomeowner';
import { HOMEOWNER_BASE, getUnreadUrl } from '@/lib/messaging';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Logo } from '@/components/trade-pilot/Logo';
import { SidebarItem } from '@/components/trade-pilot/SidebarItem';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Hammer,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const mainNavItems = [
  { path: '/homeowner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/homeowner/improvements', label: 'Home Improvements', icon: Hammer },
  { path: '/homeowner/messages', label: 'Messages', icon: MessageSquare },
  { path: '/homeowner/notifications', label: 'Notifications', icon: Bell },
];

const secondaryNavItems = [
  { path: '/homeowner/settings', label: 'Settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  '/homeowner/dashboard': 'Dashboard',
  '/homeowner/improvements': 'Home Improvements',
  '/homeowner/messages': 'Messages',
  '/homeowner/notifications': 'Notifications',
  '/homeowner/settings': 'Settings',
};

const HomeownerLayout = () => {
  const { isAuthenticated, loading, isCustomer, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ho_collapsed') === '1');

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        queryClient.invalidateQueries({ queryKey: [ME_URL] });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [queryClient]);

  // Keyed by URL so ChatPanel's own invalidation (which uses the same string)
  // refreshes this badge — a bespoke key here would never be invalidated.
  const { data: msgUnread } = useQuery({
    queryKey: [getUnreadUrl(HOMEOWNER_BASE)],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    enabled: isAuthenticated && isCustomer,
  });
  const messagesUnread: number = (msgUnread as any)?.unread_count ?? 0;

  const { data: notifsData } = useQuery({
    queryKey: ['ho-notifications-unread'],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
    enabled: isAuthenticated && isCustomer,
  });
  const notifsUnread: number = ((notifsData as any)?.notifications ?? []).filter((n: any) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCustomer) return <Navigate to="/trades-crm/dashboard" replace />;
  if (user?.onboarding_completed === false) return <Navigate to="/homeowner/onboarding" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleCollapsed = () => {
    setCollapsed(c => {
      localStorage.setItem('ho_collapsed', !c ? '1' : '0');
      return !c;
    });
  };

  const fullName = [user?.first_name, (user as any)?.last_name].filter(Boolean).join(' ') || 'User';
  const email = user?.email ?? '';

  const badgeFor = (path: string): number | undefined => {
    if (path === '/homeowner/messages' && messagesUnread > 0) return messagesUnread;
    if (path === '/homeowner/notifications' && notifsUnread > 0) return notifsUnread;
    return undefined;
  };

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
            badge={badgeFor(item.path)}
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
        <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
          <UserAvatar name={fullName} tone="brand" size="sm" />
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-white">{fullName}</div>
                <div className="truncate text-[11px] text-white/50">{email}</div>
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
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden overflow-hidden transition-all duration-300 lg:block',
          collapsed ? 'w-[72px]' : 'w-[264px]'
        )}
      >
        {sidebarInner(collapsed)}
      </aside>

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
              <div className="text-xs text-muted-foreground">TradePilot</div>
              <div className="text-h3 font-semibold leading-tight text-foreground">{pageTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => navigate('/homeowner/notifications')}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifsUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {notifsUnread > 9 ? '9+' : notifsUnread}
                </span>
              )}
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HomeownerLayout;
