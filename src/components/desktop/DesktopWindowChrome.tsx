import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Sun,
  Award,
  Laptop,
  Search,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  HardDrive,
} from 'lucide-react';
import { UserStats } from '../../types/ielts';

interface DesktopWindowChromeProps {
  userStats: UserStats;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeViewTitle: string;
  onOpenCommandPalette: () => void;
  studyTimerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetTimerMinutes: (mins: number) => void;
  onOpenOfflineCenter: () => void;
  isOfflineCached?: boolean;
}

export const DesktopWindowChrome: React.FC<DesktopWindowChromeProps> = ({
  userStats,
  isDarkMode,
  onToggleTheme,
  activeViewTitle,
  onOpenCommandPalette,
  studyTimerSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onSetTimerMinutes,
  onOpenOfflineCenter,
  isOfflineCached = false,
}) => {
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-3.5 shrink-0 select-none z-30 transition-colors">
      {/* Left Zone: Desktop Window Controls + App Identity */}
      <div className="flex items-center gap-3">
        {/* macOS/Flutter Window Buttons */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-3 h-3 rounded-full bg-rose-500/90 border border-rose-600/50 hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-amber-500/90 border border-amber-600/50 hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/90 border border-emerald-600/50 hover:opacity-80 transition-opacity" />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            IE
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            IELTS Practice
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[160px] sm:max-w-xs">
            {activeViewTitle}
          </span>
        </div>
      </div>

      {/* Center Zone: Quick Search / Command Palette Summoner */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 text-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
          title="Search modules & actions (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-medium">Quick switch...</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold shadow-2xs">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Zone: Live Exam Timer + Streak + Target Band + Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Study / Exam Countdown Timer Widget */}
        <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 font-mono tabular-nums font-bold">
            <Timer className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{formatTimer(studyTimerSeconds)}</span>
          </div>

          <button
            onClick={onToggleTimer}
            className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={isTimerRunning ? 'Pause timer' : 'Start timer'}
          >
            {isTimerRunning ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
          </button>

          <button
            onClick={onResetTimer}
            className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Preset Selector Dropdown Toggle */}
          <button
            onClick={() => setIsPresetOpen((p) => !p)}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Timer Presets"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Preset Dropdown Menu */}
          {isPresetOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPresetOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Timer Presets
                </div>
                <button
                  onClick={() => {
                    onSetTimerMinutes(60);
                    setIsPresetOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  60 min (Reading/Writing)
                </button>
                <button
                  onClick={() => {
                    onSetTimerMinutes(30);
                    setIsPresetOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  30 min (Listening)
                </button>
                <button
                  onClick={() => {
                    onSetTimerMinutes(15);
                    setIsPresetOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  15 min (Targeted Drill)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Offline Pack Status & Modal Trigger */}
        <button
          onClick={onOpenOfflineCenter}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 text-xs transition-colors shadow-2xs"
          title="Offline Center: Precache & Download Full System"
        >
          <HardDrive className={`w-3.5 h-3.5 ${isOfflineCached ? 'text-emerald-500' : 'text-blue-600 dark:text-blue-400'}`} />
          <span className="hidden sm:inline font-medium">Offline Pack</span>
          {isOfflineCached && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        {/* Streak Counter */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span className="tabular-nums">{userStats.streakDays}d Streak</span>
        </div>

        {/* Target Band Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-semibold px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Band {userStats.targetBand.toFixed(1)}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 transition-all active:scale-95"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
};
