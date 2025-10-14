import { MessageSquare, PenSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: 'feed' | 'post' | 'settings';
  onNavigate: (view: 'feed' | 'post' | 'settings') => void;
}

export function Sidebar({ collapsed, onToggle, activeView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'feed' as const, icon: MessageSquare, label: 'Feed' },
    { id: 'post' as const, icon: PenSquare, label: 'Post' },
    { id: 'settings' as const, icon: Settings, label: 'Project Settings' },
  ];

  return (
    <div
      className={cn(
        'h-full bg-gradient-to-b from-teal-50 to-emerald-50 border-r border-teal-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              activeView === item.id && 'bg-gradient-to-r from-teal-100 to-emerald-100'
            )}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </div>
  );
}
