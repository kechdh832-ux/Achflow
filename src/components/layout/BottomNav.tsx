import React from 'react';
import { Film, Play, PlusCircle, Download, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();

  const items = [
    { icon: Film, label: 'Vidéo', path: '/' },
    { icon: Play, label: 'Shorts', path: '/shorts', activeColor: 'text-primary' },
    { icon: PlusCircle, label: 'Create', path: '/upload', isSpecial: true },
    { icon: Download, label: 'Downloads', path: '/downloads' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-50 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        if (item.isSpecial) {
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center -mt-2">
              <div className="bg-white text-black p-1.5 rounded-xl shadow-lg transform active:scale-95 transition-transform">
                <div className="bg-primary rounded-lg p-1">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-[10px] mt-1 font-bold text-muted-foreground">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
              isActive ? (item.activeColor || "text-foreground") : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
            <span className={cn("text-[10px] font-bold", isActive ? "text-foreground" : "text-muted-foreground")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
