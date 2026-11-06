import React, { useState } from 'react';
import {
  Headphones,
  Target,
  Compass,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  TrendingUp,
  Calculator,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  HardDrive,
} from 'lucide-react';
import { AppView } from '../../store/ieltsStore';

interface DesktopNavRailProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  unlockedMilestonesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenOfflineCenter?: () => void;
  isOfflineCached?: boolean;
}

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  category: 'core' | 'tools';
}

export const DesktopNavRail: React.FC<DesktopNavRailProps> = ({
  currentView,
  onSelectView,
  unlockedMilestonesCount,
  isCollapsed,
  onToggleCollapse,
  onOpenOfflineCenter,
  isOfflineCached = false,
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const navItems: NavItem[] = [
    // Core Exam Modules
    {
      id: 'listening',
      label: 'Listening Lab',
      icon: Headphones,
      badge: 'Human MP3',
      category: 'core',
    },
    {
      id: 'reading',
      label: 'Reading Room',
      icon: BookOpen,
      badge: 'Focus Mode',
      category: 'core',
    },
    {
      id: 'writing',
      label: 'Writing Studio',
      icon: PenTool,
      badge: 'Rubric',
      category: 'core',
    },
    {
      id: 'speaking',
      label: 'Speaking Booth',
      icon: Mic,
      badge: 'Recorder',
      category: 'core',
    },
    {
      id: 'mock',
      label: 'Full Mock CDT',
      icon: Clock,
      badge: 'Timed',
      category: 'core',
    },
    // Tools & Progress
    {
      id: 'drills',
      label: 'Question Drills',
      icon: Target,
      badge: 'All Types',
      category: 'tools',
    },
    {
      id: 'journey',
      label: 'Milestone Path',
      icon: Compass,
      badge: `${unlockedMilestonesCount}/7`,
      category: 'tools',
    },
    {
      id: 'analytics',
      label: 'Improvement Hub',
      icon: TrendingUp,
      category: 'tools',
    },
    {
      id: 'calculator',
      label: 'Band Calculator',
      icon: Calculator,
      category: 'tools',
    },
    {
      id: 'api',
      label: 'Free IELTS API',
      icon: Globe,
      badge: 'REST',
      category: 'tools',
    },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => onSelectView(item.id)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
          className={`relative w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-2xl text-xs font-medium transition-all ${
            isActive
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <div className="flex items-center gap-3 truncate">
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </div>

          {!isCollapsed && item.badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium shrink-0 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {item.badge}
            </span>
          )}
        </button>

        {/* Floating Tooltip when Rail is Collapsed */}
        {isCollapsed && hoveredItemId === item.id && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium whitespace-nowrap shadow-xl border border-slate-700/60 pointer-events-none animate-in fade-in zoom-in-95 duration-100 flex items-center gap-2">
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600 text-white">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className={`${
        isCollapsed ? 'w-17' : 'w-56'
      } bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between py-3 px-2 shrink-0 select-none transition-all duration-200`}
    >
      <div className="space-y-4 overflow-y-auto pr-0.5">
        {/* Core Modules Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Exam Modules
            </div>
          )}
          {navItems.filter((i) => i.category === 'core').map(renderNavButton)}
        </div>

        {/* Tools Section */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Study & Tools
            </div>
          )}
          {navItems.filter((i) => i.category === 'tools').map(renderNavButton)}

          {onOpenOfflineCenter && (
            <div className="relative group pt-1">
              <button
                onClick={onOpenOfflineCenter}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                } rounded-2xl text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 transition-all border border-emerald-200/60 dark:border-emerald-800/60`}
                title={isCollapsed ? 'Offline Center & Downloads' : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <HardDrive className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {!isCollapsed && <span className="truncate font-semibold">Offline Center</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-bold text-emerald-800 dark:text-emerald-300">
                    {isOfflineCached ? 'Cached' : 'Pack'}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rail Footer Controls */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Rail</span>
              </>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-slate-400">
              [ ⇥ ]
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
