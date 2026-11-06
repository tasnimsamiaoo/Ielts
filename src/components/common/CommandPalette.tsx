import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Target,
  Compass,
  Clock,
  TrendingUp,
  Calculator,
  Globe,
  Sun,
  Moon,
  Timer,
  BookMarked,
  X,
  CornerDownLeft,
  Command,
  HardDrive,
  Library,
} from 'lucide-react';
import { AppView } from '../../store/ieltsStore';

export interface CommandAction {
  id: string;
  title: string;
  subtitle: string;
  category: 'Modules' | 'Exam Tools' | 'Actions';
  icon: React.ElementType;
  shortcut?: string;
  onExecute: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onStartTimer: (minutes: number) => void;
  onOpenOfflineCenter: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  isDarkMode,
  onStartTimer,
  onOpenOfflineCenter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: CommandAction[] = [
    {
      id: 'listening',
      title: 'Cambridge Listening Lab',
      subtitle: 'Real human studio audio & synchronized transcript',
      category: 'Modules',
      icon: Headphones,
      shortcut: '⌘1',
      onExecute: () => onNavigate('listening'),
    },
    {
      id: 'reading',
      title: 'Academic Reading Room',
      subtitle: 'Passage 1 with Focus Mode & Quick-Define dictionary',
      category: 'Modules',
      icon: BookOpen,
      shortcut: '⌘2',
      onExecute: () => onNavigate('reading'),
    },
    {
      id: 'writing',
      title: 'Writing Studio & Rubrics',
      subtitle: 'Task 1 & Task 2 band 8+ descriptors and live word count',
      category: 'Modules',
      icon: PenTool,
      shortcut: '⌘3',
      onExecute: () => onNavigate('writing'),
    },
    {
      id: 'speaking',
      title: 'Speaking Interview Booth',
      subtitle: '3-part CDT examiner simulator with mic recorder',
      category: 'Modules',
      icon: Mic,
      shortcut: '⌘4',
      onExecute: () => onNavigate('speaking'),
    },
    {
      id: 'drills',
      title: 'Question-Type Drills',
      subtitle: 'Targeted practice for MCQ, Headings, TFNG, Map Labelling',
      category: 'Modules',
      icon: Target,
      shortcut: '⌘5',
      onExecute: () => onNavigate('drills'),
    },
    {
      id: 'mock',
      title: 'Full Mock CDT Exam',
      subtitle: 'Timed authentic 2h 30m Computer-Delivered IELTS simulation',
      category: 'Modules',
      icon: Clock,
      shortcut: '⌘6',
      onExecute: () => onNavigate('mock'),
    },
    {
      id: 'library',
      title: 'Cambridge IELTS Library (Books 1–19)',
      subtitle: 'Catalog of 19 official editions, 76 full tests, & JSON past paper importer',
      category: 'Modules',
      icon: Library,
      shortcut: '⌘7',
      onExecute: () => onNavigate('library'),
    },
    {
      id: 'journey',
      title: 'Milestone Journey Path',
      subtitle: 'Animated roadmap from Band 5.5 to Band 8.5+',
      category: 'Exam Tools',
      icon: Compass,
      onExecute: () => onNavigate('journey'),
    },
    {
      id: 'analytics',
      title: 'Improvement Hub & Diagnostics',
      subtitle: 'Question accuracy matrix & +0.5 Band booster recommendation',
      category: 'Exam Tools',
      icon: TrendingUp,
      onExecute: () => onNavigate('analytics'),
    },
    {
      id: 'calculator',
      title: 'Official Band Calculator',
      subtitle: 'Academic & General raw-to-band conversion algorithm',
      category: 'Exam Tools',
      icon: Calculator,
      onExecute: () => onNavigate('calculator'),
    },
    {
      id: 'api',
      title: 'Free IELTS REST API Explorer',
      subtitle: 'Endpoints documentation & Dart/Flutter client generator',
      category: 'Exam Tools',
      icon: Globe,
      onExecute: () => onNavigate('api'),
    },
    {
      id: 'timer-60',
      title: 'Start 60-Minute Reading/Writing Timer',
      subtitle: 'Official CDT section duration with audio alert',
      category: 'Actions',
      icon: Timer,
      onExecute: () => onStartTimer(60),
    },
    {
      id: 'timer-30',
      title: 'Start 30-Minute Listening Timer',
      subtitle: 'Standard IELTS listening test time standard',
      category: 'Actions',
      icon: Timer,
      onExecute: () => onStartTimer(30),
    },
    {
      id: 'theme',
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle Material 3 soft-slate dark or crisp light mode',
      category: 'Actions',
      icon: isDarkMode ? Sun : Moon,
      shortcut: '⌘T',
      onExecute: () => onToggleTheme(),
    },
    {
      id: 'offline',
      title: 'Offline Center & Standalone Download',
      subtitle: 'Precache full system in browser or download standalone ZIP bundle',
      category: 'Actions',
      icon: HardDrive,
      shortcut: '⌘O',
      onExecute: () => onOpenOfflineCenter(),
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].onExecute();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a module, tool, or action... (e.g. 'reading', 'timer')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 text-sm font-medium bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching modules or actions found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onExecute();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-sans">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Quick Keys */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Command className="w-3 h-3" />
            <span>K anytime</span>
          </span>
        </div>
      </div>
    </div>
  );
};
