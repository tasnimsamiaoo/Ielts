import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Laptop,
  Award,
  Flag,
  HelpCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Printer,
  Eye,
  EyeOff,
  BookOpen,
  FileText,
  Headphones,
  Check,
  X,
  ExternalLink,
  Split,
  ZoomIn,
  ZoomOut,
  Highlighter,
  Library,
} from 'lucide-react';
import {
  MockQuestion,
} from '../../data/fullMockExamData';
import {
  getExamDatasetById,
  getAllAvailableMockTests,
} from '../../data/cambridgeTestGenerator';
import { CAMBRIDGE_BOOKS_CATALOG } from '../../data/cambridgeBooksCatalog';
import { rawToBand, calculateOverallBand, formatBand } from '../../utils/scoring';
import { ExamAttempt, FullMockExamResult } from '../../types/ielts';
import { TRFPreviewModal } from './TRFPreviewModal';

interface FullMockExamViewProps {
  onCompleteMock: (attempt: ExamAttempt) => void;
  onNavigateToView: (view: any) => void;
  selectedExamId?: string;
  onSelectExamId?: (examId: string) => void;
}

type ActiveSection = 'listening' | 'reading' | 'writing';

export const FullMockExamView: React.FC<FullMockExamViewProps> = ({
  onCompleteMock,
  onNavigateToView,
  selectedExamId = 'c19-t1',
  onSelectExamId,
}) => {
  // Dynamic Exam Resolution
  const [activeExamId, setActiveExamId] = useState<string>(selectedExamId);
  const [showTestSwitcherModal, setShowTestSwitcherModal] = useState<boolean>(false);

  useEffect(() => {
    if (selectedExamId && selectedExamId !== activeExamId) {
      setActiveExamId(selectedExamId);
      setExamStarted(false);
      setIsFinished(false);
      setIsPaused(false);
      setListeningAnswers({});
      setReadingAnswers({});
      setWritingTask1Text('');
      setWritingTask2Text('');
      setFlaggedQuestions(new Set());
      setCurrentQuestionNumber(1);
      setActiveSection('listening');
      setTotalTimeElapsed(0);
      setSecondsRemaining(1920);
    }
  }, [selectedExamId, activeExamId]);

  const currentExamData = useMemo(() => {
    return getExamDatasetById(activeExamId);
  }, [activeExamId]);

  // Test Setup & Candidate Info
  const [candidateName, setCandidateName] = useState<string>(
    currentExamData.candidateNameDefault
  );
  const [candidateId, setCandidateId] = useState<string>(
    currentExamData.candidateIdDefault
  );
  const [isStrictExamMode, setIsStrictExamMode] = useState<boolean>(true);

  // Sync candidate fields when switching tests before start
  useEffect(() => {
    setCandidateName(currentExamData.candidateNameDefault);
    setCandidateId(currentExamData.candidateIdDefault);
  }, [currentExamData]);

  // Exam Lifecycle
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [showTrfModal, setShowTrfModal] = useState<boolean>(false);
  const [hideTimer, setHideTimer] = useState<boolean>(false);

  // Active Section & Navigation State
  const [activeSection, setActiveSection] = useState<ActiveSection>('listening');
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [activeWritingTask, setActiveWritingTask] = useState<1 | 2>(1);

  // Timers: Listening ~32m (1920s), Reading 60m (3600s), Writing 60m (3600s)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1920);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);

  // Answers & Flags
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [writingTask1Text, setWritingTask1Text] = useState<string>('');
  const [writingTask2Text, setWritingTask2Text] = useState<string>('');
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Reading UI Utilities
  const [readingSplitRatio, setReadingSplitRatio] = useState<number>(50); // percentage for passage
  const [readingFontSize, setReadingFontSize] = useState<number>(15);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const [highlightedParagraphs, setHighlightedParagraphs] = useState<Set<string>>(new Set());

  // Audio Playback State for Listening
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Final Results Form
  const [examResult, setExamResult] = useState<FullMockExamResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');

  // Timer Tick Engine
  useEffect(() => {
    let interval: number | null = null;
    if (examStarted && !isPaused && !isFinished && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSectionTimeExpired();
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, isPaused, isFinished, secondsRemaining, activeSection]);

  // Handle Audio playback sync when section or question changes
  useEffect(() => {
    if (examStarted && activeSection === 'listening' && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : audioVolume;
      if (!isPaused && isStrictExamMode) {
        audioRef.current.play().catch(() => {
          // Autoplay policy fallback
        });
        setIsPlayingAudio(true);
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  }, [examStarted, activeSection, isPaused, isMuted, audioVolume, isStrictExamMode]);

  // Section Time Expiration Progression
  const handleSectionTimeExpired = () => {
    if (activeSection === 'listening') {
      setActiveSection('reading');
      setCurrentQuestionNumber(1);
      setSecondsRemaining(3600); // 60 mins for Reading
    } else if (activeSection === 'reading') {
      setActiveSection('writing');
      setCurrentQuestionNumber(1);
      setSecondsRemaining(3600); // 60 mins for Writing
    } else {
      calculateAndFinishExam();
    }
  };

  // Start Simulation
  const handleStartExam = () => {
    setExamStarted(true);
    setIsFinished(false);
    setActiveSection('listening');
    setCurrentQuestionNumber(1);
    setSecondsRemaining(1920); // 32 minutes
    setTotalTimeElapsed(0);
    setListeningAnswers({});
    setReadingAnswers({});
    setWritingTask1Text('');
    setWritingTask2Text('');
    setFlaggedQuestions(new Set());
  };

  // Jump to specific Section
  const handleSwitchSection = (section: ActiveSection) => {
    setActiveSection(section);
    setCurrentQuestionNumber(1);
    if (section === 'listening') {
      setSecondsRemaining(1920);
    } else if (section === 'reading') {
      setSecondsRemaining(3600);
    } else {
      setSecondsRemaining(3600);
    }
  };

  // Toggle Flag on Active Question
  const handleToggleActiveFlag = () => {
    const qKey = `${activeSection === 'listening' ? 'L' : activeSection === 'reading' ? 'R' : 'W'}-${currentQuestionNumber}`;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qKey)) {
        next.delete(qKey);
      } else {
        next.add(qKey);
      }
      return next;
    });
  };

  // Answer handler
  const handleAnswerInput = (questionId: string, value: string) => {
    if (activeSection === 'listening') {
      setListeningAnswers((prev) => ({ ...prev, [questionId]: value }));
    } else if (activeSection === 'reading') {
      setReadingAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  // Answer Normalization Comparator for Cambridge Rubric
  const isAnswerMatching = (userAns: string, accepted: string | string[]): boolean => {
    if (!userAns || !userAns.trim()) return false;
    const cleanUser = userAns.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');

    const acceptedList = Array.isArray(accepted) ? accepted : [accepted];
    return acceptedList.some((target) => {
      const cleanTarget = target.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');
      return cleanUser === cleanTarget;
    });
  };

  // Compute Full Official Exam Results
  const calculateAndFinishExam = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setShowSubmitConfirmModal(false);

    // 1. Grade Listening (40 questions)
    let listeningRaw = 0;
    const listeningDetails: FullMockExamResult['questionDetails'] = [];

    currentExamData.listening.parts.forEach((part) => {
      part.questions.forEach((q) => {
        const userVal = listeningAnswers[q.id] || '';
        const correct = isAnswerMatching(userVal, q.correctAnswer);
        if (correct) listeningRaw++;

        listeningDetails.push({
          id: q.id,
          number: q.number,
          module: 'listening',
          part: q.part,
          prompt: q.prompt,
          userAnswer: userVal,
          correctAnswer: q.correctAnswer,
          isCorrect: correct,
          explanation: q.explanation,
          flagged: flaggedQuestions.has(q.id),
        });
      });
    });

    // 2. Grade Reading (40 questions)
    let readingRaw = 0;
    const readingDetails: FullMockExamResult['questionDetails'] = [];

    currentExamData.reading.parts.forEach((part) => {
      part.questions.forEach((q) => {
        const userVal = readingAnswers[q.id] || '';
        const correct = isAnswerMatching(userVal, q.correctAnswer);
        if (correct) readingRaw++;

        readingDetails.push({
          id: q.id,
          number: q.number,
          module: 'reading',
          part: q.part,
          prompt: q.prompt,
          userAnswer: userVal,
          correctAnswer: q.correctAnswer,
          isCorrect: correct,
          explanation: q.explanation,
          flagged: flaggedQuestions.has(q.id),
        });
      });
    });

    // 3. Grade Writing via Rubric
    const task1Words = writingTask1Text.trim() ? writingTask1Text.trim().split(/\s+/).length : 0;
    const task2Words = writingTask2Text.trim() ? writingTask2Text.trim().split(/\s+/).length : 0;

    let writingBand = 6.0;
    if (task1Words >= 150 && task2Words >= 250) {
      writingBand = 7.0;
      if (task2Words >= 280 && writingTask2Text.toLowerCase().includes('consequently')) {
        writingBand = 7.5;
      }
    } else if (task1Words >= 120 && task2Words >= 200) {
      writingBand = 6.5;
    } else if (task1Words < 100 || task2Words < 150) {
      writingBand = 5.5;
    }

    const speakingBand = 7.0; // Standard baseline for CDT simulation

    const listeningBand = rawToBand(listeningRaw, 'listening');
    const readingBand = rawToBand(readingRaw, 'reading', true);

    const overallBand = calculateOverallBand(
      listeningBand,
      readingBand,
      writingBand,
      speakingBand
    );

    // CEFR Level derivation
    let cefr = 'B2';
    if (overallBand >= 8.5) cefr = 'C2 (Mastery)';
    else if (overallBand >= 7.0) cefr = 'C1 (Effective Operational Proficiency)';
    else if (overallBand >= 5.5) cefr = 'B2 (Vantage)';
    else cefr = 'B1 (Threshold)';

    const resultData: FullMockExamResult = {
      id: `trf-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      candidateName,
      candidateNumber: candidateId,
      testCenterCode: currentExamData.testCenterCode,
      testType: 'Academic',
      listeningRaw,
      listeningBand,
      readingRaw,
      readingBand,
      writingBand,
      speakingBand,
      overallBand,
      cefrLevel: cefr,
      timeSpentSeconds: totalTimeElapsed,
      listeningAnswers,
      readingAnswers,
      writingTask1Text,
      writingTask2Text,
      questionDetails: [...listeningDetails, ...readingDetails],
    };

    setExamResult(resultData);
    setIsFinished(true);
    setExamStarted(false);

    // Record Exam Attempt into user study journey
    const attempt: ExamAttempt = {
      id: resultData.id,
      date: resultData.date,
      title: currentExamData.title,
      module: 'full_mock',
      rawScore: listeningRaw + readingRaw,
      totalQuestions: 80,
      bandScore: overallBand,
      timeSpentSeconds: totalTimeElapsed,
    };
    onCompleteMock(attempt);
  };

  // Timer formatter
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find active question object
  const getActiveQuestion = (): MockQuestion | null => {
    if (activeSection === 'listening') {
      for (const part of currentExamData.listening.parts) {
        const found = part.questions.find((q) => q.number === currentQuestionNumber);
        if (found) return found;
      }
    } else if (activeSection === 'reading') {
      for (const part of currentExamData.reading.parts) {
        const found = part.questions.find((q) => q.number === currentQuestionNumber);
        if (found) return found;
      }
    }
    return null;
  };

  // Find active passage for Reading
  const getActiveReadingPassage = () => {
    for (const part of currentExamData.reading.parts) {
      if (part.questions.some((q) => q.number === currentQuestionNumber)) {
        return part;
      }
    }
    return currentExamData.reading.parts[0];
  };

  // Count answered questions for bottom status bar
  const countAnswered = (section: 'listening' | 'reading'): number => {
    const answers = section === 'listening' ? listeningAnswers : readingAnswers;
    return Object.values(answers).filter((v) => v && v.trim().length > 0).length;
  };

  // Check if a question is answered
  const isQuestionAnswered = (section: 'listening' | 'reading', num: number): boolean => {
    const qKey = `${section === 'listening' ? 'L' : 'R'}-${num}`;
    const answers = section === 'listening' ? listeningAnswers : readingAnswers;
    return Boolean(answers[qKey] && answers[qKey].trim().length > 0);
  };

  // Active question key
  const activeQuestionKey = `${activeSection === 'listening' ? 'L' : activeSection === 'reading' ? 'R' : 'W'}-${currentQuestionNumber}`;
  const isCurrentFlagged = flaggedQuestions.has(activeQuestionKey);

  // Print TRF Handler
  const handlePrintTRF = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      {/* Hidden Audio Player for Listening */}
      <audio
        ref={audioRef}
        src="/audio/section-1.mp3"
        preload="auto"
        onEnded={() => setIsPlayingAudio(false)}
      />

      {/* VIEW 1: PRE-TEST CANDIDATE BRIEFING & SOUND CHECK */}
      {!examStarted && !isFinished && (
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-2xl w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Official Cambridge & IDP Format
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {currentExamData.title}
                  </h1>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">TEST CODE</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {currentExamData.examCode}
                </span>
              </div>
            </div>

            {/* Active Test Paper Highlight Banner */}
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Active Test Paper
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {currentExamData.examCode}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {currentExamData.title}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentExamData.testCenterCode} · 40 Listening + 40 Reading + 2 Writing Tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTestSwitcherModal(true)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-750 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Library className="w-3.5 h-3.5" />
                  <span>Switch Test Paper</span>
                </button>
              </div>
            </div>

            {/* Quick Pick Edition & Paper Strip (All 76 Cambridge Tests) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Quick Paper Selection</span>
                  <span className="text-[10px] font-normal text-slate-500">· 76 Official Tests (Books 19 down to 1)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTestSwitcherModal(true)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Browse All Papers</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Fast Jump Editions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CAMBRIDGE_BOOKS_CATALOG.map((book) => {
                  const isBookActive = activeExamId.startsWith(`c${book.bookNumber}-`);
                  return (
                    <div
                      key={book.id}
                      className={`flex items-center gap-1 shrink-0 px-2 py-1 rounded-xl border transition-all ${
                        isBookActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isBookActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        B{book.bookNumber}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {book.tests.map((test) => {
                          const isTestSelected = activeExamId === test.id;
                          return (
                            <button
                              key={test.id}
                              type="button"
                              onClick={() => {
                                setActiveExamId(test.id);
                                if (onSelectExamId) onSelectExamId(test.id);
                              }}
                              className={`px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md transition-all ${
                                isTestSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600'
                              }`}
                              title={test.title}
                            >
                              T{test.testNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidate Verification Inputs */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate ID Number
                </label>
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID Number"
                />
              </div>
            </div>

            {/* Section Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Headphones className="w-4 h-4" />
                  <span className="text-xs font-bold">1. Listening</span>
                </div>
                <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                  40 Qs · 32m
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Parts 1–4 with authentic Cambridge audio track and form fills.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold">2. Reading</span>
                </div>
                <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                  40 Qs · 60m
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  3 Academic passages with split-screen CDT passage viewer.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold">3. Writing</span>
                </div>
                <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                  2 Tasks · 60m
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Task 1 chart report (150w) & Task 2 argument essay (250w).
                </p>
              </div>
            </div>

            {/* Audio Check & Sound Bar */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Headphone & Sound Verification
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ensure you can hear the spoken sample clearly at a comfortable volume.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : audioVolume}
                  onChange={(e) => {
                    setAudioVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                    if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                  }}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      if (isPlayingAudio) {
                        audioRef.current.pause();
                        setIsPlayingAudio(false);
                      } else {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play();
                        setIsPlayingAudio(true);
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Stop Sound' : 'Play Sample'}</span>
                </button>
              </div>
            </div>

            {/* Strict Exam Mode Option */}
            <div className="flex items-center justify-between text-xs px-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="strict-mode"
                  checked={isStrictExamMode}
                  onChange={(e) => setIsStrictExamMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="strict-mode" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Strict Exam Mode (enforces sequential timing & one-time audio playback)
                </label>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Total Exam Duration: 2h 32m
              </span>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartExam}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start {currentExamData.title}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE OFFICIAL CDT TEST ENVIRONMENT */}
      {examStarted && !isFinished && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* OFFICIAL CDT TOP CHROME BAR */}
          <header className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between shrink-0 shadow-md border-b border-slate-800">
            {/* Left: Candidate Info & Section Tracker */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide">
                  Candidate: {candidateName}
                </span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-slate-300">ID: {candidateId}</span>
              </div>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-900/60 text-blue-200 border border-blue-700/60 text-[11px] font-mono font-semibold max-w-sm truncate">
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{currentExamData.title}</span>
              </span>

              <span className="text-slate-600 hidden md:inline">|</span>

              {/* Section Tabs */}
              <div className="hidden sm:flex items-center gap-1.5">
                {(['listening', 'reading', 'writing'] as ActiveSection[]).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleSwitchSection(sec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      activeSection === sec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Controls, Review Flag, Timer, Submit */}
            <div className="flex items-center gap-3">
              {/* Review Flag Button (Official CDT Feature) */}
              {activeSection !== 'writing' && (
                <button
                  onClick={handleToggleActiveFlag}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isCurrentFlagged
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Flag active question for later review"
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-current' : ''}`} />
                  <span>{isCurrentFlagged ? 'Flagged for Review' : 'Review'}</span>
                </button>
              )}

              {/* Countdown Timer with Hide Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="tabular-nums text-amber-300">
                  {hideTimer ? '--:--' : formatTimer(secondsRemaining)}
                </span>
                <button
                  onClick={() => setHideTimer((h) => !h)}
                  className="ml-1 text-slate-400 hover:text-slate-200"
                  title={hideTimer ? 'Show timer' : 'Hide timer'}
                >
                  {hideTimer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Help & Shortcuts */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Help and keyboard shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* End Section / Submit Button */}
              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </header>

          {/* MAIN TEST WORKSPACE BODY */}
          <div className="flex-1 flex overflow-hidden">
            {/* WORKSPACE 1: LISTENING SECTION */}
            {activeSection === 'listening' && (
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {/* Audio Status Banner */}
                <div className="px-6 py-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Cambridge Official Audio Track Playing
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Audio plays once in full. Keep headphones on.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted((m) => !m)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : audioVolume}
                      onChange={(e) => {
                        setAudioVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                        if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                      }}
                      className="w-20 accent-blue-600"
                    />
                  </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
                  {(() => {
                    const activeQ = getActiveQuestion();
                    if (!activeQ) return null;

                    const activePart = currentExamData.listening.parts.find(
                      (p) => p.partNumber === activeQ.part
                    );

                    const userVal = listeningAnswers[activeQ.id] || '';

                    return (
                      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
                        {/* Part Context Header */}
                        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {activePart?.title}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {activePart?.instructions}
                          </p>
                        </div>

                        {/* Question Instruction & Number */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              Question {activeQ.number} of 40
                            </span>

                            {flaggedQuestions.has(activeQ.id) && (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Flag className="w-3.5 h-3.5 fill-current" /> Flagged for Review
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {activeQ.prompt}
                          </div>
                        </div>

                        {/* Input Options */}
                        {activeQ.type === 'multiple_choice' && activeQ.options ? (
                          <div className="space-y-2 pt-2">
                            {activeQ.options.map((opt) => {
                              const optLetter = opt.charAt(0);
                              const isSelected = userVal.toUpperCase() === optLetter.toUpperCase();

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleAnswerInput(activeQ.id, optLetter)}
                                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold shadow-xs'
                                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                      isSelected
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-300 dark:border-slate-600 text-slate-500'
                                    }`}
                                  >
                                    {optLetter}
                                  </div>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="pt-2">
                            <label className="text-xs font-semibold text-slate-500 block mb-2">
                              Your Answer:
                            </label>
                            <input
                              type="text"
                              value={userVal}
                              onChange={(e) => handleAnswerInput(activeQ.id, e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setCurrentQuestionNumber((n) => Math.min(40, n + 1));
                                }
                              }}
                            />
                            <span className="text-[11px] text-slate-400 mt-2 block">
                              Press Enter to advance to the next question.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* WORKSPACE 2: READING SECTION (SPLIT SCREEN) */}
            {activeSection === 'reading' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Left Split: Reading Passage */}
                <div
                  style={{ width: `${readingSplitRatio}%` }}
                  className="h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  {/* Reading Passage Header Controls */}
                  <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                      {getActiveReadingPassage().passageTitle}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHighlightMode((h) => !h)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          highlightMode
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Toggle paragraph highlighter"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => setReadingFontSize((s) => Math.max(13, s - 1))}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono px-1">{readingFontSize}px</span>
                        <button
                          onClick={() => setReadingFontSize((s) => Math.min(20, s + 1))}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Passage Text Scroll Area */}
                  <div
                    className="flex-1 p-6 overflow-y-auto space-y-5 leading-relaxed text-slate-800 dark:text-slate-200"
                    style={{ fontSize: `${readingFontSize}px` }}
                  >
                    {getActiveReadingPassage().passageParagraphs?.map((para) => {
                      const isHighlighted = highlightedParagraphs.has(para.id);

                      return (
                        <div
                          key={para.id}
                          onClick={() => {
                            if (highlightMode) {
                              setHighlightedParagraphs((prev) => {
                                const next = new Set(prev);
                                if (next.has(para.id)) next.delete(para.id);
                                else next.add(para.id);
                                return next;
                              });
                            }
                          }}
                          className={`p-3 rounded-xl transition-all ${
                            isHighlighted
                              ? 'bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700'
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs mb-1">
                            [{para.label}]
                          </span>
                          <p>{para.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Split: Reading Questions */}
                <div
                  style={{ width: `${100 - readingSplitRatio}%` }}
                  className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto p-6"
                >
                  {(() => {
                    const activeQ = getActiveQuestion();
                    if (!activeQ) return null;

                    const userVal = readingAnswers[activeQ.id] || '';

                    return (
                      <div className="max-w-xl mx-auto w-full p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                            Reading Question {activeQ.number} of 40
                          </span>

                          {flaggedQuestions.has(activeQ.id) && (
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Flag className="w-3.5 h-3.5 fill-current" /> Flagged
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {activeQ.instruction}
                          </span>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                            {activeQ.prompt}
                          </div>
                        </div>

                        {/* TFNG or Multiple Choice Buttons */}
                        {activeQ.type === 'true_false_not_given' ? (
                          <div className="space-y-2 pt-2">
                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((choice) => (
                              <button
                                key={choice}
                                onClick={() => handleAnswerInput(activeQ.id, choice)}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                                  userVal.toUpperCase() === choice
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <span>{choice}</span>
                                {userVal.toUpperCase() === choice && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        ) : activeQ.options ? (
                          <div className="space-y-2 pt-2">
                            {activeQ.options.map((opt) => {
                              const optVal = opt.split('.')[0].trim();
                              const isSelected = userVal.toUpperCase() === optVal.toUpperCase();

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleAnswerInput(activeQ.id, optVal)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                                    isSelected
                                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-900 dark:text-blue-200 font-bold'
                                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="pt-2">
                            <input
                              type="text"
                              value={userVal}
                              onChange={(e) => handleAnswerInput(activeQ.id, e.target.value)}
                              placeholder="Type your answer from the passage..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setCurrentQuestionNumber((n) => Math.min(40, n + 1));
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* WORKSPACE 3: WRITING SECTION (TASK 1 & TASK 2) */}
            {activeSection === 'writing' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Left Split: Prompt & Chart Description */}
                <div className="w-1/2 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-6 space-y-6">
                  {/* Task 1 / Task 2 Selector Tabs */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
                    <button
                      onClick={() => setActiveWritingTask(1)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeWritingTask === 1
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Task 1 (Report · 150 words)
                    </button>
                    <button
                      onClick={() => setActiveWritingTask(2)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeWritingTask === 2
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Task 2 (Essay · 250 words)
                    </button>
                  </div>

                  {/* Task Instructions & Prompt */}
                  {activeWritingTask === 1 ? (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Official IELTS Academic Task 1
                        </span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {currentExamData.writing.task1.title}
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {currentExamData.writing.task1.instructions}
                        </p>
                      </div>

                      {/* Task 1 Bar Chart Table */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {currentExamData.writing.task1.chartDetails?.title}
                        </span>

                        <div className="space-y-2.5 text-xs">
                          {currentExamData.writing.task1.chartDetails?.dataPoints.map((dp) => (
                            <div key={dp.category} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold">
                                <span>{dp.category}</span>
                                <span className="font-mono text-slate-500">
                                  2010: {dp.value2010} TWh → 2025: {dp.value2025} TWh
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                                <div
                                  style={{ width: `${(dp.value2010 / 5000) * 100}%` }}
                                  className="h-full bg-blue-400"
                                  title={`2010: ${dp.value2010}`}
                                />
                                <div
                                  style={{ width: `${((dp.value2025 - dp.value2010) / 5000) * 100}%` }}
                                  className="h-full bg-blue-600"
                                  title={`2025: ${dp.value2025}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          Official IELTS Academic Task 2
                        </span>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {currentExamData.writing.task2.title}
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {currentExamData.writing.task2.instructions}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {currentExamData.writing.task2.prompt}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Split: Live CDT Essay Editor */}
                <div className="w-1/2 h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-6 overflow-hidden">
                  {(() => {
                    const currentText = activeWritingTask === 1 ? writingTask1Text : writingTask2Text;
                    const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
                    const minTarget = activeWritingTask === 1 ? 150 : 250;

                    return (
                      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {/* Editor Header Bar */}
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Candidate Essay Response — Task {activeWritingTask}
                          </span>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                                wordCount >= minTarget
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              }`}
                            >
                              Word Count: {wordCount} / {minTarget}
                            </span>
                          </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                          value={currentText}
                          onChange={(e) => {
                            if (activeWritingTask === 1) setWritingTask1Text(e.target.value);
                            else setWritingTask2Text(e.target.value);
                          }}
                          placeholder={
                            activeWritingTask === 1
                              ? 'Write your Task 1 academic report here (summarize main features, compare data points)...'
                              : 'Write your Task 2 essay here (discuss both views and state your personal opinion)...'
                          }
                          className="flex-1 p-5 text-sm font-sans leading-relaxed text-slate-900 dark:text-slate-100 bg-transparent resize-none focus:outline-none"
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* CDT SIGNATURE BOTTOM QUESTION BAR (40 QUESTIONS) */}
          {activeSection !== 'writing' && (
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 py-2.5 shrink-0 flex items-center justify-between shadow-md">
              {/* Question Number Palette (1 to 40) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-4xl scrollbar-thin">
                {Array.from({ length: 40 }).map((_, i) => {
                  const qNum = i + 1;
                  const isCurrent = currentQuestionNumber === qNum;
                  const isAns = isQuestionAnswered(activeSection, qNum);
                  const isFlag = flaggedQuestions.has(
                    `${activeSection === 'listening' ? 'L' : 'R'}-${qNum}`
                  );

                  return (
                    <button
                      key={qNum}
                      onClick={() => setCurrentQuestionNumber(qNum)}
                      className={`relative w-8 h-8 rounded-lg text-xs font-mono font-bold shrink-0 transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                          : isAns
                          ? 'bg-slate-800 text-slate-100 dark:bg-slate-700'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span>{qNum}</span>

                      {/* Official CDT Flag Dog-Ear Marker */}
                      {isFlag && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Back & Next Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 mr-2">
                  Answered: {countAnswered(activeSection)} / 40
                </span>

                <button
                  onClick={() => setCurrentQuestionNumber((n) => Math.max(1, n - 1))}
                  disabled={currentQuestionNumber === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentQuestionNumber((n) => Math.min(40, n + 1))}
                  disabled={currentQuestionNumber === 40}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </footer>
          )}
        </div>
      )}

      {/* VIEW 3: OFFICIAL CANDIDATE TEST REPORT FORM (TRF) */}
      {isFinished && examResult && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="max-w-4xl w-full space-y-6">
            {/* Top Certificate Actions */}
            <div className="flex items-center justify-between print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Examination Concluded & Scored
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowTrfModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all ring-2 ring-blue-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Generate TRF</span>
                </button>

                <button
                  onClick={handlePrintTRF}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleStartExam}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Mock</span>
                </button>
              </div>
            </div>

            {/* THE OFFICIAL TEST REPORT FORM CARD */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
              {/* TRF Header Banner */}
              <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                    BRITISH COUNCIL · IDP: IELTS AUSTRALIA · CAMBRIDGE ENGLISH
                  </span>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                    Test Report Form (TRF) — Academic
                  </h1>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">REPORT ID</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {examResult.id}
                  </span>
                </div>
              </div>

              {/* Candidate Credentials Box */}
              <div className="grid grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Candidate Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{examResult.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Candidate Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{examResult.candidateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Test Center</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">{examResult.testCenterCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Test Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{examResult.date}</span>
                </div>
              </div>

              {/* 4-Skill Band Score Row & Overall Band */}
              <div className="grid grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Listening</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {formatBand(examResult.listeningBand)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {examResult.listeningRaw}/40 Raw
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Reading</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {formatBand(examResult.readingBand)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {examResult.readingRaw}/40 Raw
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Writing</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {formatBand(examResult.writingBand)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Evaluated
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Speaking</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {formatBand(examResult.speakingBand)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Standard
                  </span>
                </div>

                {/* OVERALL PROMINENT BAND SCORE */}
                <div className="p-4 rounded-2xl bg-blue-600 text-white text-center shadow-lg">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    Overall Band
                  </span>
                  <div className="text-3xl font-black font-mono mt-1">
                    {formatBand(examResult.overallBand)}
                  </div>
                  <span className="text-[10px] text-blue-200 font-semibold block truncate">
                    {examResult.cefrLevel.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* CEFR Level Descriptor */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    CEFR Level: {examResult.cefrLevel}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Candidate demonstrates operational command of academic English with complex discourse comprehension.
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToView('analytics')}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                >
                  View Full Analytics
                </button>
              </div>

              {/* DETAILED QUESTION-BY-QUESTION SOLUTIONS REVIEW */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Item-by-Item Solutions & Cambridge Examiner Notes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review all 80 questions with official answer keys, correct answers, and trap explanations.
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        reviewFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      All (80)
                    </button>
                    <button
                      onClick={() => setReviewFilter('incorrect')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        reviewFilter === 'incorrect'
                          ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Incorrect Only ({examResult.questionDetails.filter((q) => !q.isCorrect).length})
                    </button>
                    <button
                      onClick={() => setReviewFilter('flagged')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        reviewFilter === 'flagged'
                          ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Flagged ({examResult.questionDetails.filter((q) => q.flagged).length})
                    </button>
                  </div>
                </div>

                {/* Question Details List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {examResult.questionDetails
                    .filter((q) => {
                      if (reviewFilter === 'incorrect') return !q.isCorrect;
                      if (reviewFilter === 'flagged') return q.flagged;
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                          item.isCorrect
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300">
                              {item.module.toUpperCase()} Q{item.number}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.prompt}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.flagged && (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-current" />
                              </span>
                            )}
                            {item.isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Correct
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Incorrect
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Your Answer:</span>
                            <span
                              className={`font-semibold ${
                                item.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {item.userAnswer || '(blank / not answered)'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-500 block">Official Correct Answer:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {Array.isArray(item.correctAnswer)
                                ? item.correctAnswer.join(' / ')
                                : item.correctAnswer}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <strong className="text-slate-700 dark:text-slate-300">Examiner Rationale: </strong>
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CDT HELP & SHORTCUTS MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Official CDT Keyboard Shortcuts & Navigation
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Next Question</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono">Enter / Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Flag / Unflag Question</span>
                <span className="font-semibold text-amber-600">Review button in header</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Jump to Question</span>
                <span>Click any number 1–40 in bottom bar</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Toggle Reading Highlighter</span>
                <span className="font-semibold text-blue-600">Highlighter icon</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM SUBMISSION MODAL */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ready to Submit Exam for Official Grading?
                </h3>
                <p className="text-xs text-slate-500">
                  You cannot edit your answers once submitted.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Listening Questions Answered:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {countAnswered('listening')} / 40
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reading Questions Answered:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {countAnswered('reading')} / 40
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Writing Task 1 Word Count:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {writingTask1Text.trim() ? writingTask1Text.trim().split(/\s+/).length : 0} / 150 words
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Writing Task 2 Word Count:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {writingTask2Text.trim() ? writingTask2Text.trim().split(/\s+/).length : 0} / 250 words
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Flagged for Review:</span>
                <span className="font-bold text-amber-600">{flaggedQuestions.size} questions</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={calculateAndFinishExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Submit for Grading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST SWITCHER MODAL */}
      {showTestSwitcherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Select Examination Paper
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose from Cambridge Books 10 through 19 or your imported papers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestSwitcherModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {getAllAvailableMockTests().map((test) => {
                const isSelected = test.id === activeExamId;
                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => {
                      setActiveExamId(test.id);
                      if (onSelectExamId) onSelectExamId(test.id);
                      setShowTestSwitcherModal(false);
                      setListeningAnswers({});
                      setReadingAnswers({});
                      setWritingTask1Text('');
                      setWritingTask2Text('');
                      setFlaggedQuestions(new Set());
                      setCurrentQuestionNumber(1);
                      setActiveSection('listening');
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {test.bookNumber ? `B${test.bookNumber}` : 'CDT'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {test.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {test.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans">
                              {test.badge}
                            </span>
                          )}
                          <span>·</span>
                          <span>80 Questions · Timed CDT</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
              <span className="text-slate-500">40 Official Tests Available + Custom Imports</span>
              <button
                type="button"
                onClick={() => setShowTestSwitcherModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED TRF CERTIFICATE MODAL */}
      {examResult && (
        <TRFPreviewModal
          result={examResult}
          isOpen={showTrfModal}
          onClose={() => setShowTrfModal(false)}
        />
      )}
    </div>
  );
};
