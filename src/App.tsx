/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useIeltsStore, AppView } from './store/ieltsStore';
import { DesktopWindowChrome } from './components/desktop/DesktopWindowChrome';
import { DesktopNavRail } from './components/desktop/DesktopNavRail';
import { CommandPalette } from './components/common/CommandPalette';
import { OfflineCenterModal } from './components/offline/OfflineCenterModal';
import { getOfflineCacheStatus } from './utils/offlineManager';
import { ListeningLabView } from './components/listening/ListeningLabView';
import { QuestionDrillsView } from './components/drills/QuestionDrillsView';
import { MilestoneJourneyView } from './components/journey/MilestoneJourneyView';
import { ReadingRoomView } from './components/reading/ReadingRoomView';
import { WritingStudioView } from './components/writing/WritingStudioView';
import { SpeakingBoothView } from './components/speaking/SpeakingBoothView';
import { ImprovementDashboardView } from './components/analytics/ImprovementDashboardView';
import { BandCalculatorView } from './components/calculator/BandCalculatorView';
import { FullMockExamView } from './components/mock/FullMockExamView';
import { ApiExplorerView } from './components/api/ApiExplorerView';
import { CambridgeLibraryView } from './components/library/CambridgeLibraryView';
import { QuestionType } from './types/ielts';

export default function App() {
  const {
    currentView,
    setCurrentView,
    isDarkMode,
    toggleTheme,
    userStats,
    setTargetBand,
    addXp,
    recordDrillAccuracy,
    recordExamAttempt,
    completeMilestone,
    examHistory,
    activeDrillType,
    setActiveDrillType,
    selectedExamId,
    setSelectedExamId,
  } = useIeltsStore();

  // Navigation rail collapse state (persisted)
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ielts_rail_collapsed') === 'true';
    }
    return false;
  });

  const handleToggleRail = () => {
    setIsRailCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ielts_rail_collapsed', String(next));
      return next;
    });
  };

  // Command Palette State (Cmd+K)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Offline Center Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ielts_offline_cached') === 'true';
    }
    return false;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Check offline cache on mount
  useEffect(() => {
    getOfflineCacheStatus().then((status) => {
      setIsOfflineCached(status.isCached);
    });
  }, [isOfflineModalOpen]);

  // Study & Exam Countdown Timer State
  const [studyTimerSeconds, setStudyTimerSeconds] = useState<number>(60 * 60); // 60 min default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && studyTimerSeconds > 0) {
      interval = setInterval(() => {
        setStudyTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, studyTimerSeconds]);

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setStudyTimerSeconds(60 * 60);
  };

  const handleSetTimerMinutes = (mins: number) => {
    setStudyTimerSeconds(mins * 60);
    setIsTimerRunning(true);
  };

  // Global Keyboard Shortcuts (Cmd+K for Command Palette, Cmd+O for Offline Center)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        setIsOfflineModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getViewTitle = (view: AppView): string => {
    switch (view) {
      case 'listening':
        return 'Cambridge Listening Lab';
      case 'reading':
        return 'Academic Reading Room';
      case 'writing':
        return 'Writing Studio & Rubric';
      case 'speaking':
        return 'Speaking Interview Booth';
      case 'mock':
        return 'Official CDT Full Mock Exam';
      case 'library':
        return 'Cambridge IELTS Library (Books 1–19)';
      case 'drills':
        return 'Targeted Question Drills';
      case 'journey':
        return 'Animated Milestone Journey';
      case 'analytics':
        return 'Improvement Status & Diagnostics';
      case 'calculator':
        return 'Official Band Calculator';
      case 'api':
        return 'Open IELTS Practice REST API';
      default:
        return 'IELTS Practice';
    }
  };

  const handleNavigateToDrill = (type: QuestionType) => {
    setActiveDrillType(type);
    setCurrentView('drills');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Flutter Desktop Window Chrome (Title bar, Timer, Command search, Offline Pack, Theme) */}
      <DesktopWindowChrome
        userStats={userStats}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeViewTitle={getViewTitle(currentView)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        studyTimerSeconds={studyTimerSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        onSetTimerMinutes={handleSetTimerMinutes}
        onOpenOfflineCenter={() => setIsOfflineModalOpen(true)}
        isOfflineCached={isOfflineCached}
      />

      {/* Main Desktop Container (Nav Rail + Viewport) */}
      <div className="flex-1 flex overflow-hidden bg-slate-100/70 dark:bg-slate-950">
        {/* Collapsible Material 3 Vertical Navigation Rail */}
        <DesktopNavRail
          currentView={currentView}
          onSelectView={setCurrentView}
          unlockedMilestonesCount={userStats.unlockedMilestones.length}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={handleToggleRail}
          onOpenOfflineCenter={() => setIsOfflineModalOpen(true)}
          isOfflineCached={isOfflineCached}
        />

        {/* Active Module Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentView === 'listening' && (
            <ListeningLabView
              selectedExamId={selectedExamId}
              onSelectExamId={setSelectedExamId}
              onAddXp={addXp}
              onRecordAttempt={(score, band) => {
                recordExamAttempt({
                  id: `list-${Date.now()}`,
                  date: 'Today',
                  title: 'Cambridge Listening Section Drill',
                  module: 'listening',
                  rawScore: score,
                  totalQuestions: 8,
                  bandScore: band,
                  timeSpentSeconds: 320,
                });
              }}
            />
          )}

          {currentView === 'drills' && (
            <QuestionDrillsView
              userStats={userStats}
              activeDrillType={activeDrillType}
              onSelectDrillType={setActiveDrillType}
              onRecordResult={(type, correct, total) => {
                recordDrillAccuracy(type, correct, total);
              }}
            />
          )}

          {currentView === 'journey' && (
            <MilestoneJourneyView
              userStats={userStats}
              onCompleteMilestone={completeMilestone}
              onNavigateToModule={setCurrentView}
            />
          )}

          {currentView === 'reading' && (
            <ReadingRoomView
              onAddXp={addXp}
              selectedExamId={selectedExamId}
              onSelectExamId={setSelectedExamId}
            />
          )}

          {currentView === 'writing' && (
            <WritingStudioView />
          )}

          {currentView === 'speaking' && (
            <SpeakingBoothView />
          )}

          {currentView === 'mock' && (
            <FullMockExamView
              onCompleteMock={recordExamAttempt}
              onNavigateToView={setCurrentView}
              selectedExamId={selectedExamId}
              onSelectExamId={setSelectedExamId}
            />
          )}

          {currentView === 'library' && (
            <CambridgeLibraryView
              onNavigateToView={setCurrentView}
              onSelectTest={(testId) => {
                setSelectedExamId(testId);
              }}
            />
          )}

          {currentView === 'analytics' && (
            <ImprovementDashboardView
              userStats={userStats}
              examHistory={examHistory}
              onNavigateToDrill={handleNavigateToDrill}
              onSetTargetBand={setTargetBand}
            />
          )}

          {currentView === 'calculator' && (
            <BandCalculatorView />
          )}

          {currentView === 'api' && (
            <ApiExplorerView />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        onStartTimer={handleSetTimerMinutes}
        onOpenOfflineCenter={() => setIsOfflineModalOpen(true)}
      />

      {/* Dedicated Offline Center & Standalone Download Modal */}
      <OfflineCenterModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={() => setIsSimulatedOffline((p) => !p)}
      />
    </div>
  );
}
