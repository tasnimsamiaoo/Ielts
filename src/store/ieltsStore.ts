import { useEffect, useState } from 'react';
import { ExamAttempt, QuestionType, UserStats } from '../types/ielts';
import { INITIAL_MILESTONES } from '../data/milestones';

export type AppView =
  | 'journey'
  | 'listening'
  | 'drills'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'mock'
  | 'library'
  | 'analytics'
  | 'calculator'
  | 'api';

const DEFAULT_USER_STATS: UserStats = {
  targetBand: 7.5,
  currentEstimatedBand: 6.5,
  xp: 420,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedDrillCount: 14,
  questionTypeAccuracy: {
    multiple_choice: { correct: 18, total: 24 },
    fill_in_the_blank: { correct: 27, total: 30 },
    matching_headings: { correct: 8, total: 12 },
    true_false_not_given: { correct: 10, total: 14 },
    map_labelling: { correct: 6, total: 8 },
    matching_features: { correct: 5, total: 7 },
    summary_completion: { correct: 7, total: 9 },
    writing_task1: { correct: 3, total: 4 },
    writing_task2: { correct: 2, total: 3 },
    speaking_cue_card: { correct: 3, total: 3 },
  },
  recentScores: [
    { date: 'Nov 1', band: 6.0, module: 'listening' },
    { date: 'Nov 2', band: 6.5, module: 'reading' },
    { date: 'Nov 3', band: 6.5, module: 'listening' },
    { date: 'Nov 4', band: 7.0, module: 'listening' },
  ],
  unlockedMilestones: ['m1', 'm2'],
};

const INITIAL_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-1',
    date: 'Nov 1, 2026',
    title: 'Cambridge 17 Listening Section 1 & 2',
    module: 'listening',
    rawScore: 23,
    totalQuestions: 40,
    bandScore: 6.0,
    timeSpentSeconds: 1650,
  },
  {
    id: 'att-2',
    date: 'Nov 3, 2026',
    title: 'Academic Reading Passage 1: Soil Restoration',
    module: 'reading',
    rawScore: 28,
    totalQuestions: 40,
    bandScore: 6.5,
    timeSpentSeconds: 3420,
  },
  {
    id: 'att-3',
    date: 'Nov 4, 2026',
    title: 'Cambridge 18 Listening Full Section 1-4',
    module: 'listening',
    rawScore: 30,
    totalQuestions: 40,
    bandScore: 7.0,
    timeSpentSeconds: 1840,
  },
];

export function useIeltsStore() {
  const [currentView, setCurrentView] = useState<AppView>('listening');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ielts_theme');
      return saved ? saved === 'dark' : false;
    }
    return false;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ielts_user_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_USER_STATS;
  });

  const [examHistory, setExamHistory] = useState<ExamAttempt[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ielts_exam_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_ATTEMPTS;
  });

  const [activeDrillType, setActiveDrillType] = useState<QuestionType>('multiple_choice');
  const [selectedExamId, setSelectedExamIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ielts_selected_exam_id');
      if (saved) return saved;
    }
    return 'c19-t1';
  });

  const setSelectedExamId = (examId: string) => {
    setSelectedExamIdState(examId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ielts_selected_exam_id', examId);
    }
  };

  // Sync theme with documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('ielts_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ielts_theme', 'light');
    }
  }, [isDarkMode]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('ielts_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ielts_exam_history', JSON.stringify(examHistory));
  }, [examHistory]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTargetBand = (band: number) => {
    setUserStats((prev) => ({ ...prev, targetBand: band }));
  };

  const addXp = (amount: number) => {
    setUserStats((prev) => ({ ...prev, xp: prev.xp + amount }));
  };

  const recordDrillAccuracy = (type: QuestionType, correct: number, total: number) => {
    setUserStats((prev) => {
      const current = prev.questionTypeAccuracy[type] || { correct: 0, total: 0 };
      const updated = {
        correct: current.correct + correct,
        total: current.total + total,
      };
      const newAccuracy = { ...prev.questionTypeAccuracy, [type]: updated };
      const newXp = prev.xp + correct * 15;
      const newCompleted = prev.completedDrillCount + 1;

      return {
        ...prev,
        xp: newXp,
        completedDrillCount: newCompleted,
        questionTypeAccuracy: newAccuracy,
      };
    });
  };

  const recordExamAttempt = (attempt: ExamAttempt) => {
    setExamHistory((prev) => [attempt, ...prev]);
    setUserStats((prev) => ({
      ...prev,
      recentScores: [
        ...prev.recentScores.slice(-5),
        {
          date: attempt.date.split(',')[0] || 'Today',
          band: attempt.bandScore,
          module: attempt.module as any,
        },
      ],
      currentEstimatedBand: attempt.bandScore,
      xp: prev.xp + Math.round(attempt.rawScore * 10),
    }));
  };

  const completeMilestone = (milestoneId: string) => {
    setUserStats((prev) => {
      if (prev.unlockedMilestones.includes(milestoneId)) return prev;
      const milestone = INITIAL_MILESTONES.find((m) => m.id === milestoneId);
      const bonusXp = milestone ? milestone.xpReward : 200;
      return {
        ...prev,
        xp: prev.xp + bonusXp,
        unlockedMilestones: [...prev.unlockedMilestones, milestoneId],
      };
    });
  };

  return {
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
  };
}
