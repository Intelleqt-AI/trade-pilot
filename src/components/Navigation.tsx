import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-slate-100 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="hover:opacity-80 transition-opacity duration-150">
              <img src="/lovable-uploads/7a0926c1-fceb-4602-bd62-9abc593c1b6a.png" alt="Trade Pilot logo" className="h-24 sm:h-32 md:h-40 w-auto -my-6 sm:-my-8 md:-my-12" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link to="/trades" className="text-foreground hover:text-secondary transition-colors duration-150">
                Trades
              </Link>
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
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  {/* <Button variant="default" asChild>
                    <Link to="/join">Join free</Link>
                  </Button> */}
                  <Button variant="outline" asChild>
                    <Link to="/trades/join">Join</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/trades"
                className="block px-3 py-2 text-foreground hover:text-secondary transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                Trades
              </Link>
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
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
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
                      Sign In
                    </Button>
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/join" onClick={() => setIsOpen(false)}>
                        Join free
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/trades/join" onClick={() => setIsOpen(false)}>
                        Join as Trade
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
