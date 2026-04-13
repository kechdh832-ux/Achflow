import React from 'react';
import { Film, PlaySquare, Download, Clock, ThumbsUp, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { icon: Film, label: 'Vidéo', path: '/' },
  { icon: PlaySquare, label: 'Shorts', path: '/shorts' },
  { icon: Download, label: 'Downloads', path: '/downloads' },
];

const LIBRARY_ITEMS = [
  { icon: PlaySquare, label: 'Library', path: '/library' },
  { icon: Clock, label: 'History', path: '/history' },
  { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-[104px] bottom-0 bg-background border-r transition-all duration-300 z-40 overflow-y-auto",
        isOpen ? "w-64" : "w-0 lg:w-20 lg:px-2"
      )}
    >
      <div className="py-4 flex flex-col gap-2">
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            isCollapsed={!isOpen}
            onClick={onClose}
          />
        ))}

        <div className="h-px bg-border my-2 mx-4" />

        {LIBRARY_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            isCollapsed={!isOpen}
            onClick={onClose}
          />
        ))}

        <div className="h-px bg-border my-2 mx-4" />

        <SidebarItem
          icon={User}
          label="Profile"
          path="/profile"
          isActive={location.pathname === '/profile'}
          isCollapsed={!isOpen}
          onClick={onClose}
        />
        <SidebarItem
          icon={Settings}
          label="Settings"
          path="/settings"
          isActive={location.pathname === '/settings'}
          isCollapsed={!isOpen}
          onClick={onClose}
        />
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  key?: string | number;
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, path, isActive, isCollapsed, onClick }: SidebarItemProps) {
  return (
    <Link
      to={path}
      onClick={() => {
        if (window.innerWidth < 1024 && onClick) {
          onClick();
        }
      }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-lg mx-2 transition-colors",
        isActive ? "bg-secondary text-primary font-medium" : "hover:bg-muted text-muted-foreground",
        isCollapsed && "justify-center px-0 mx-1"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
      {!isCollapsed && <span className="text-sm">{label}</span>}
      {isCollapsed && <span className="sr-only">{label}</span>}
    </Link>
  );
}
