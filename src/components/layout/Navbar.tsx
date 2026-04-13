import React, { useState } from 'react';
import { Search, Mic, MoreVertical, LogIn, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';
import { AuthModal } from '../AuthModal';
import { Logo } from '../Logo';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || '');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  React.useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set('q', searchValue);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-background z-50 flex flex-col border-b border-border">
        {/* Top Row */}
        <div className="h-14 flex items-center justify-between px-4 gap-4">
          {isMobileSearchOpen ? (
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              </Button>
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 h-9 bg-secondary border-none rounded-full px-4 text-sm focus:ring-1 focus:ring-primary transition-all"
              />
              <Button type="submit" variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onMenuClick} className="hidden lg:flex">
                  <Menu className="h-5 w-5" />
                </Button>
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.3)] group-hover:scale-105 transition-transform">
                    <Logo />
                  </div>
                  <span className="text-foreground font-black tracking-tighter text-2xl leading-none hidden sm:block">VidFlow</span>
                </Link>
              </div>

              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                <div className="relative group w-full">
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full h-9 bg-secondary border-none rounded-full px-4 text-sm focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </form>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setIsMobileSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                  <Mic className="h-5 w-5" />
                </Button>
                
                {!user ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 gap-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Button>
                ) : (
                  <Link to="/profile">
                    <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors ml-2">
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                        alt={user.displayName || 'User'} 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Row (Tabs) */}
        <div className="h-12 flex items-center justify-between px-4">
          <div className="flex gap-8 h-full">
            <Link 
              to="/" 
              className={cn(
                "flex items-center h-full text-sm font-bold transition-colors",
                location.pathname === '/' ? "text-foreground tab-active" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Vidéo
            </Link>
            <Link 
              to="/shorts" 
              className={cn(
                "flex items-center h-full text-sm font-bold transition-colors",
                location.pathname === '/shorts' ? "text-foreground tab-active" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Shorts
            </Link>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
