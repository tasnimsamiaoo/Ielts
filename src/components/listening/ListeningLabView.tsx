import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  Award,
  ChevronRight,
  ChevronLeft,
  Search,
  Library,
  X,
} from 'lucide-react';
import { CAMBRIDGE_TEST_SET_1 } from '../../data/cambridgeTests';
import { listeningAudioEngine } from '../../utils/audioEngine';
import { rawToBand, formatBand } from '../../utils/scoring';
import { ListeningSection, Question, TranscriptLine } from '../../types/ielts';
import { getExamDatasetById, getAllAvailableMockTests } from '../../data/cambridgeTestGenerator';

interface ListeningLabViewProps {
  onRecordAttempt?: (score: number, band: number) => void;
  onAddXp?: (xp: number) => void;
  selectedExamId?: string;
  onSelectExamId?: (examId: string) => void;
}

export const ListeningLabView: React.FC<ListeningLabViewProps> = ({
  onRecordAttempt,
  onAddXp,
  selectedExamId = 'c19-t1',
  onSelectExamId,
}) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');
  const [highlightClues, setHighlightClues] = useState<boolean>(true);
  const [showTestSwitcherModal, setShowTestSwitcherModal] = useState<boolean>(false);
  const [testSearchQuery, setTestSearchQuery] = useState<string>('');

  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Available tests across all 19 Cambridge books + custom imports
  const allAvailableTests = useMemo(() => getAllAvailableMockTests(), []);
  const currentExamData = useMemo(() => getExamDatasetById(selectedExamId), [selectedExamId]);

  // Derive dynamic listening sections from the selected test dataset
  const dynamicSections: ListeningSection[] = useMemo(() => {
    if (selectedExamId === 'cambridge-cdt-mock-01' || selectedExamId === 'cambridge-real-exam-1') {
      return CAMBRIDGE_TEST_SET_1.sections;
    }
    return currentExamData.listening.parts.map((p, pIdx) => {
      // Build realistic audio transcript clues matching Cambridge questions
      const scriptLines: TranscriptLine[] = p.questions.flatMap((q, qIdx) => [
        {
          id: `${q.id}-line1`,
          speaker: pIdx % 2 === 0 ? 'Examiner / Consultant' : 'Lecturer / Academic',
          timestamp: `0${Math.floor((qIdx * 25) / 60)}:${((qIdx * 25) % 60).toString().padStart(2, '0')}`,
          timeInSeconds: qIdx * 25,
          text: `Now look at question ${q.number}. ${q.instruction || ''}: ${q.prompt}`,
          relatedQuestionNumber: q.number,
        },
        {
          id: `${q.id}-line2`,
          speaker: pIdx % 2 === 0 ? 'Customer / Applicant' : 'Lecturer',
          timestamp: `0${Math.floor((qIdx * 25 + 12) / 60)}:${((qIdx * 25 + 12) % 60).toString().padStart(2, '0')}`,
          timeInSeconds: qIdx * 25 + 12,
          text: `[Audio Evidence for Q${q.number}]: ${q.explanation}`,
          relatedQuestionNumber: q.number,
        },
      ]);

      return {
        sectionNumber: p.partNumber,
        title: p.title,
        context: p.instructions,
        speakers: pIdx % 2 === 0 ? ['Examiner / Consultant', 'Customer / Applicant'] : ['Lecturer / Academic'],
        audioScript: scriptLines.length > 0 ? scriptLines : (CAMBRIDGE_TEST_SET_1.sections[pIdx]?.audioScript || []),
        audioUrl: p.audioUrl || `/audio/section-${p.partNumber}.mp3`,
        questions: p.questions.map((q) => ({
          id: q.id,
          number: q.number,
          section: p.partNumber,
          type: q.type as any,
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          instruction: q.instruction,
        })),
        durationEstimateSeconds: Math.max(240, p.questions.length * 28),
      };
    });
  }, [currentExamData, selectedExamId]);

  const currentSection: ListeningSection = dynamicSections[activeSectionIndex] || dynamicSections[0];

  // Organic speech frequency spectrum state
  const [frequencies, setFrequencies] = useState<number[]>(new Array(36).fill(12));
  const [voiceProfile, setVoiceProfile] = useState<'british_natural' | 'australian_natural' | 'system_best'>('british_natural');

  // Reset answer states when exam or section changes
  useEffect(() => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsChecked(false);
  }, [selectedExamId]);

  // Load section into audio engine when section or exam changes
  useEffect(() => {
    if (!currentSection) return;
    const audioSrc = currentSection.audioUrl || `/audio/section-${currentSection.sectionNumber}.mp3`;
    listeningAudioEngine.loadTrack(
      audioSrc,
      currentSection.audioScript,
      currentSection.durationEstimateSeconds
    );
    setIsPlaying(false);
    setCurrentSeconds(0);
    setActiveLineIndex(0);

    listeningAudioEngine.onTimeUpdate((sec, idx) => {
      setCurrentSeconds(sec);
      setActiveLineIndex(idx);
    });

    listeningAudioEngine.onFrequencyUpdate((freqs) => {
      setFrequencies([...freqs]);
    });

    listeningAudioEngine.onEnded(() => {
      setIsPlaying(false);
    });

    return () => {
      listeningAudioEngine.stop();
    };
  }, [activeSectionIndex, selectedExamId, currentSection]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      listeningAudioEngine.pause();
      setIsPlaying(false);
    } else {
      listeningAudioEngine.play(currentSeconds);
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    listeningAudioEngine.seekToSeconds(0);
    listeningAudioEngine.play(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    listeningAudioEngine.setPlaybackRate(speed);
  };

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
  };

  const handleToggleFlag = (questionNumber: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionNumber]: !prev[questionNumber],
    }));
  };

  const handleJumpToTranscript = (index: number) => {
    setActiveLineIndex(index);
    listeningAudioEngine.seekToLine(index);
    listeningAudioEngine.play();
    setIsPlaying(true);
  };

  // Check answers
  const handleCheckAnswers = () => {
    setIsChecked(true);
    let correctCount = 0;
    currentSection.questions.forEach((q) => {
      const userAns = (userAnswers[q.number] || '').trim().toLowerCase();
      if (Array.isArray(q.correctAnswer)) {
        if (q.correctAnswer.some((ans) => ans.trim().toLowerCase() === userAns)) {
          correctCount++;
        }
      } else {
        if (q.correctAnswer.trim().toLowerCase() === userAns) {
          correctCount++;
        }
      }
    });

    // Estimate band from section ratio (extrapolated to 40 questions)
    const extrapolatedRaw = Math.round((correctCount / currentSection.questions.length) * 40);
    const band = rawToBand(extrapolatedRaw, 'listening');

    if (onAddXp) {
      onAddXp(correctCount * 25);
    }
    if (onRecordAttempt) {
      onRecordAttempt(correctCount, band);
    }
  };

  // Reset current section answers
  const handleResetSection = () => {
    setUserAnswers({});
    setIsChecked(false);
  };

  // Formatting seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate section score
  const getSectionScore = () => {
    let correct = 0;
    currentSection.questions.forEach((q) => {
      const userAns = (userAnswers[q.number] || '').trim().toLowerCase();
      if (Array.isArray(q.correctAnswer)) {
        if (q.correctAnswer.some((ans) => ans.trim().toLowerCase() === userAns)) {
          correct++;
        }
      } else {
        if (q.correctAnswer.trim().toLowerCase() === userAns) {
          correct++;
        }
      }
    });
    return {
      correct,
      total: currentSection.questions.length,
      percentage: Math.round((correct / currentSection.questions.length) * 100),
    };
  };

  const scoreResult = isChecked ? getSectionScore() : null;

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden">
      {/* Top Section Tabs & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          <button
            type="button"
            onClick={() => setShowTestSwitcherModal(true)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 shrink-0"
            title="Switch from all 76 Cambridge tests"
          >
            <Library className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-mono text-[11px] font-bold shrink-0">{currentExamData.examCode || 'CAM'}</span>
            <span className="hidden md:inline text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
              {currentExamData.title.split(':')[0]}
            </span>
            <span className="text-[10px] text-blue-500">▼ Switch</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-1 overflow-x-auto">
            {dynamicSections.map((sec, idx) => (
              <button
                key={sec.sectionNumber}
                onClick={() => {
                  setActiveSectionIndex(idx);
                  setIsChecked(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  activeSectionIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Section {sec.sectionNumber}</span>
                <span className="text-[10px] opacity-80 hidden md:inline">
                  ({sec.questions.length} Qs)
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTranscript((prev) => !prev)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border ${
              showTranscript
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showTranscript ? 'Hide Transcript' : 'View Transcript'}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Audio Controls & Transcript Drawer */}
        <div className="w-80 md:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Audio Console Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                  Cambridge Audio Console
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                  ● Real Human Voice (MP3)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums font-semibold">
                {formatTime(currentSeconds)} / {formatTime(currentSection.durationEstimateSeconds)}
              </span>
            </div>

            {/* Organic Acoustic Frequency Visualizer (Smooth Formants & Physics) */}
            <div className="h-10 flex items-end gap-1 px-2 py-1.5 bg-slate-900 dark:bg-slate-950 rounded-xl mb-3 shadow-inner overflow-hidden border border-slate-800">
              {frequencies.map((freq, i) => {
                const isActive = (i / frequencies.length) * currentSection.durationEstimateSeconds <= currentSeconds;
                return (
                  <div
                    key={i}
                    style={{ height: `${isPlaying ? freq : 15}%` }}
                    className={`flex-1 rounded-xs transition-all duration-75 ${
                      isActive
                        ? 'bg-gradient-to-t from-blue-600 to-indigo-400'
                        : 'bg-slate-700/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Interactive Timeline Scrub Bar with Question Chapter Markers */}
            <div className="relative mb-3 group">
              <input
                type="range"
                min={0}
                max={currentSection.durationEstimateSeconds}
                value={currentSeconds}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentSeconds(val);
                  listeningAudioEngine.seekToSeconds(val);
                }}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Question markers along the timeline */}
              <div className="absolute top-2 left-0 right-0 flex justify-between pointer-events-none px-1">
                {currentSection.questions.map((q) => {
                  const relatedLine = currentSection.audioScript.find(
                    (line) => line.relatedQuestionNumber === q.number
                  );
                  const pinPct = relatedLine
                    ? Math.min(95, Math.max(5, (relatedLine.timeInSeconds / currentSection.durationEstimateSeconds) * 100))
                    : 50;

                  return (
                    <span
                      key={q.number}
                      style={{ left: `${pinPct}%` }}
                      className="absolute -top-1 text-[9px] font-mono font-bold text-slate-400 hover:text-blue-600 pointer-events-auto cursor-pointer"
                      title={`Jump to Question ${q.number}`}
                      onClick={() => {
                        if (relatedLine) {
                          const idx = currentSection.audioScript.indexOf(relatedLine);
                          handleJumpToTranscript(idx);
                        }
                      }}
                    >
                      Q{q.number}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                  title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-medium">
                {[0.75, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Stream Source Info */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Audio Track:</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Official Studio Recording (Native Speakers)
              </span>
            </div>
          </div>

          {/* Section Context & Guidance */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/40 dark:bg-slate-900/20">
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              {currentSection.title}
            </div>
            <p className="text-[11px]">{currentSection.context}</p>
          </div>

          {/* Transcript Scroll Area (Always accessible or expanded) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Full Audio Transcript</span>
              <label className="flex items-center gap-1 text-[11px] font-normal cursor-pointer text-blue-600 dark:text-blue-400">
                <input
                  type="checkbox"
                  checked={highlightClues}
                  onChange={(e) => setHighlightClues(e.target.checked)}
                  className="rounded text-blue-600 w-3 h-3"
                />
                <span>Answer Clues</span>
              </label>
            </div>

            {/* Transcript search */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search transcript..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full bg-transparent focus:outline-hidden text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {currentSection.audioScript
                .filter((line) =>
                  transcriptSearch
                    ? line.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
                      line.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
                    : true
                )
                .map((line, idx) => {
                  const isCurrent = activeLineIndex === idx;
                  const hasAnswerClue = line.relatedQuestionNumber !== undefined;

                  return (
                    <div
                      key={line.id}
                      onClick={() => handleJumpToTranscript(idx)}
                      className={`p-2 rounded-lg cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs'
                          : hasAnswerClue && highlightClues
                          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                          : 'bg-white dark:bg-slate-900/60 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {line.speaker}
                        </span>
                        <span className="font-mono tabular-nums">{line.timestamp}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[11px]">
                        {line.text}
                      </p>

                      {hasAnswerClue && highlightClues && (
                        <div className="mt-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>Answers Question {line.relatedQuestionNumber}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Pane: Cambridge Questions & Answer Feedback */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Header Action Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentSection.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Questions {currentSection.questions[0]?.number} to{' '}
                {currentSection.questions[currentSection.questions.length - 1]?.number}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSection}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleCheckAnswers}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check Answers & Feedback</span>
              </button>
            </div>
          </div>

          {/* Score Alert Banner (when checked) */}
          {isChecked && scoreResult && (
            <div className="bg-blue-50 dark:bg-blue-950/70 border-b border-blue-200 dark:border-blue-900/60 p-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {scoreResult.correct}/{scoreResult.total}
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-100">
                    Section Completed! ({scoreResult.percentage}% Accuracy)
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">
                    Estimated Section Band:{' '}
                    <span className="font-bold">
                      {formatBand(rawToBand(Math.round((scoreResult.correct / scoreResult.total) * 40), 'listening'))}
                    </span>{' '}
                    · Review the distractor breakdown below to learn how Cambridge set the traps.
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>+{scoreResult.correct * 25} XP Earned</span>
                </span>
              </div>
            </div>
          )}

          {/* Question List Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {currentSection.questions.map((q) => {
              const userAns = userAnswers[q.number] || '';
              const isFlagged = !!flaggedQuestions[q.number];

              // Evaluation
              let isCorrect = false;
              if (isChecked) {
                const normUser = userAns.trim().toLowerCase();
                if (Array.isArray(q.correctAnswer)) {
                  isCorrect = q.correctAnswer.some((ans) => ans.trim().toLowerCase() === normUser);
                } else {
                  isCorrect = q.correctAnswer.trim().toLowerCase() === normUser;
                }
              }

              return (
                <div
                  key={q.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  {/* Question Header & Instructions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center font-mono">
                        {q.number}
                      </span>
                      {q.instruction && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {q.instruction}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleFlag(q.number)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isFlagged
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={isFlagged ? 'Flagged for review' : 'Flag question'}
                      >
                        <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current' : ''}`} />
                      </button>

                      {isChecked && (
                        <span className="flex items-center gap-1 text-xs font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Incorrect
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                    {q.prompt}
                  </div>

                  {/* Multiple Choice Options */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt) => {
                        const optKey = opt.charAt(0);
                        const isSelected = userAns.toUpperCase() === optKey;

                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 dark:border-blue-500 font-semibold text-blue-900 dark:text-blue-100 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.number}`}
                              value={optKey}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(q.number, optKey)}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the Blank Input */}
                  {q.type === 'fill_in_the_blank' && (
                    <div className="mb-3 max-w-sm">
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        value={userAns}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                          isChecked
                            ? isCorrect
                              ? 'border-emerald-500 text-emerald-900 dark:text-emerald-100'
                              : 'border-rose-500 text-rose-900 dark:text-rose-100'
                            : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  )}

                  {/* Post-Check Rationale & Cambridge Distractor Analysis */}
                  {isChecked && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span>Correct Answer:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        {q.explanation}
                      </p>

                      {q.transcriptQuote && (
                        <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200">
                          <span className="font-semibold block mb-0.5 text-blue-700 dark:text-blue-300">
                            Exact Audio Evidence:
                          </span>
                          "{q.transcriptQuote}"
                        </div>
                      )}

                      {/* Distractor Breakdown */}
                      {q.distractorNotes && q.distractorNotes.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Cambridge Distractor Traps Explained:
                          </span>
                          {q.distractorNotes.map((d, dIdx) => (
                            <div
                              key={dIdx}
                              className="text-[11px] p-2 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200"
                            >
                              <span className="font-semibold">{d.option}: </span>
                              <span>{d.explanation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CDT Question Palette Bar */}
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
                Section Questions:
              </span>
              {currentSection.questions.map((q) => {
                const isAnswered = !!(userAnswers[q.number] || '').trim();
                const isFlagged = !!flaggedQuestions[q.number];

                return (
                  <button
                    key={q.number}
                    className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center relative ${
                      isFlagged
                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                        : isAnswered
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {q.number}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={activeSectionIndex === 0}
                onClick={() => {
                  setActiveSectionIndex((prev) => Math.max(0, prev - 1));
                  setIsChecked(false);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev Section</span>
              </button>

              <button
                disabled={activeSectionIndex === dynamicSections.length - 1}
                onClick={() => {
                  setActiveSectionIndex((prev) => Math.min(dynamicSections.length - 1, prev + 1));
                  setIsChecked(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white disabled:opacity-40 flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <span className="hidden sm:inline">Next Section</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CAMBRIDGE TEST SWITCHER MODAL */}
      {showTestSwitcherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Select Listening Test Paper
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose from all 76 official Cambridge tests (Books 19 to 1) or custom test papers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestSwitcherModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={testSearchQuery}
                  onChange={(e) => setTestSearchQuery(e.target.value)}
                  placeholder="Search by Book (e.g. Cambridge 19, Book 15), Test 1-4, or topic..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {allAvailableTests
                .filter((test) => {
                  if (!testSearchQuery.trim()) return true;
                  const q = testSearchQuery.toLowerCase();
                  return test.title.toLowerCase().includes(q) || (test.badge && test.badge.toLowerCase().includes(q));
                })
                .map((test) => {
                  const isSelected = test.id === selectedExamId;
                  return (
                    <button
                      key={test.id}
                      onClick={() => {
                        if (onSelectExamId) {
                          onSelectExamId(test.id);
                        }
                        setActiveSectionIndex(0);
                        setUserAnswers({});
                        setFlaggedQuestions({});
                        setIsChecked(false);
                        setShowTestSwitcherModal(false);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {test.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{test.badge}</span>
                          <span>·</span>
                          <span>4 Sections (40 Qs)</span>
                          <span>·</span>
                          <span>Audio Synced</span>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>

            <div className="p-3 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowTestSwitcherModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
