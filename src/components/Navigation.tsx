import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppsPopover from '@/components/AppsPopover';
import { APPS_PATH, AREAS_HREF, SHOW_AREAS_LINK, TRADE_PAGES } from '@/lib/siteNav';
import { useAuth } from '@/hooks/useAuth';

// Shared style for the text items in the header (Trades, Areas, Sign in) so they always match.
const navItem = 'text-[15px] font-medium text-foreground hover:text-secondary transition-colors duration-150';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  // The public site is light only (the theme toggle was removed), so clear any saved dark preference.
  useEffect(() => {
    if (resolvedTheme === 'dark') setTheme('light');
  }, [resolvedTheme, setTheme]);

  return (
    <nav className="sticky top-0 z-50 bg-muted backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="hover:opacity-80 transition-opacity duration-150">
              {resolvedTheme === 'dark' ? (
                <img src="/trade-pilot-footer-logo-white-cropped.png" alt="Trade Pilot logo" className="h-9 w-auto md:h-11" />
              ) : (
                <span className="relative block h-9 w-[150px] overflow-hidden md:h-11 md:w-[180px]">
                  <img
                    src="/site-assets/7a0926c1-fceb-4602-bd62-9abc593c1b6a.png"
                    alt="Trade Pilot logo"
                    className="absolute left-[-35px] top-[-54px] w-[220px] max-w-none md:left-[-60px] md:top-[-65px] md:w-[265px]"
                  />
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 outline-none ${navItem}`}>
                  Trades
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {TRADE_PAGES.map(({ label, href }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link to={href}>{label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {SHOW_AREAS_LINK && (
                <Link to={AREAS_HREF} className={navItem}>
                  Areas
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-foreground text-sm">Hello, {profile?.first_name}</span>
                  <Button variant="ghost" onClick={() => navigate('/profile')}>
                    Profile
                  </Button>
                  <Button variant="ghost" onClick={signOut} disabled={loading}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login?type=trade" className={navItem}>
                    Sign in
                  </Link>
                  <AppsPopover>
                    <Button variant="outline">Apps</Button>
                  </AppsPopover>
                  <Button variant="outline" asChild>
                    <Link to="/trades/join">Join as a trade</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="px-3 py-2 text-foreground font-medium">Trades</div>
              {TRADE_PAGES.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className="block px-6 py-2 text-foreground hover:text-secondary transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {SHOW_AREAS_LINK && (
                <Link
                  to={AREAS_HREF}
                  className="block px-3 py-2 text-foreground hover:text-secondary transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  Areas
                </Link>
              )}
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <>
                    <div className="text-foreground text-sm py-2">Hello, {profile?.first_name}</div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/profile');
                        setIsOpen(false);
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={async () => {
                        await signOut();
                        setIsOpen(false);
                        navigate('/login', { replace: true });
                      }}
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/login');
                        setIsOpen(false);
                      }}
                    >
                      Sign in
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={APPS_PATH} onClick={() => setIsOpen(false)}>Apps</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/trades/join" onClick={() => setIsOpen(false)}>
                        Join as a trade
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
