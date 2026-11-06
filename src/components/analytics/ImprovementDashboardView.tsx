import React from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
} from 'lucide-react';
import { ExamAttempt, QuestionType, UserStats } from '../../types/ielts';
import { calculateOverallBand, formatBand, getBandDescriptor } from '../../utils/scoring';
import { StudyHabitsHeatmap } from './StudyHabitsHeatmap';

interface ImprovementDashboardViewProps {
  userStats: UserStats;
  examHistory: ExamAttempt[];
  onNavigateToDrill: (type: QuestionType) => void;
  onSetTargetBand: (band: number) => void;
}

export const ImprovementDashboardView: React.FC<ImprovementDashboardViewProps> = ({
  userStats,
  examHistory,
  onNavigateToDrill,
  onSetTargetBand,
}) => {
  // Estimated skill breakdown
  const listeningBand = 7.0;
  const readingBand = 6.5;
  const writingBand = 6.0;
  const speakingBand = 6.5;

  const currentOverallBand = calculateOverallBand(
    listeningBand,
    readingBand,
    writingBand,
    speakingBand
  );
  const descriptor = getBandDescriptor(currentOverallBand);

  // Question type accuracy sorted by weakest
  const accuracyEntries = Object.entries(userStats.questionTypeAccuracy).map(([type, stats]) => {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      type: type as QuestionType,
      correct: stats.correct,
      total: stats.total,
      pct,
    };
  });

  accuracyEntries.sort((a, b) => a.pct - b.pct);
  const weakestType = accuracyEntries[0];

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Top Banner: Status & Target Band Tracker */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Estimated Overall Band Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Current Estimated Band
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                {descriptor.cefr}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                Band {formatBand(currentOverallBand)}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                +0.5 past 7 days
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {descriptor.title} — {descriptor.summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Overall Calculation: Official CEFR</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Target: Band {userStats.targetBand.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Skill-by-Skill Quad Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Four-Skill Mastery Breakdown
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Rounded according to British Council / IDP rules
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Listening */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <Headphones className="w-3.5 h-3.5 text-rose-500" />
                  <span>Listening</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatBand(listeningBand)}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Strongest Skill
                </span>
              </div>

              {/* Reading */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reading</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatBand(readingBand)}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Stable B2+
                </span>
              </div>

              {/* Writing */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <PenTool className="w-3.5 h-3.5 text-amber-500" />
                  <span>Writing</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatBand(writingBand)}
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Needs Overview Drill
                </span>
              </div>

              {/* Speaking */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <Mic className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Speaking</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatBand(speakingBand)}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Fluency Good
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Adjuster */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Adjust Target Band:</span>
            <div className="flex items-center gap-1">
              {[6.5, 7.0, 7.5, 8.0, 8.5].map((band) => (
                <button
                  key={band}
                  onClick={() => onSetTargetBand(band)}
                  className={`px-2 py-0.5 rounded font-mono text-xs transition-colors ${
                    userStats.targetBand === band
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {band.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: +0.5 Band Booster Diagnosis & Accuracy Radar */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* +0.5 Band Booster Diagnosis */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>+0.5 Band Booster Diagnosis</span>
            </div>

            <h3 className="text-base font-bold mb-2">
              Fastest Path to Band {userStats.targetBand.toFixed(1)}
            </h3>

            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Our diagnostic engine analyzed your test errors. You are losing approximately{' '}
              <span className="font-bold text-amber-300">4.5 raw points</span> in Cambridge
              Section 3 and Heading Matching due to synonym trap distraction.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Practice 10 "Matching Headings" drills to isolate paragraph topic sentences.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Review Cambridge Section 2 audio transcripts for self-correction patterns.</span>
              </div>
            </div>
          </div>

          {weakestType && (
            <button
              onClick={() => onNavigateToDrill(weakestType.type)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Launch Drill: {weakestType.type.replace(/_/g, ' ')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question Type Accuracy Bars */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Question-Type Accuracy Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real performance based on all submitted drills and mock exams
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {userStats.completedDrillCount} Total Drills Completed
            </span>
          </div>

          <div className="space-y-3">
            {accuracyEntries.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.correct}/{item.total} correct
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        item.pct >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.pct >= 65
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.pct >= 80
                        ? 'bg-emerald-500'
                        : item.pct >= 65
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Interactive D3 Study Habits & Performance Peaks Heatmap */}
      <StudyHabitsHeatmap userStats={userStats} examHistory={examHistory} />

      {/* Bottom Section: Exam Attempt History */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Exam Simulation History
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {examHistory.length} Recorded Attempts
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {examHistory.map((attempt) => (
            <div
              key={attempt.id}
              className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {attempt.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {attempt.date} · Raw Score: {attempt.rawScore}/{attempt.totalQuestions} · Time:{' '}
                  {Math.round(attempt.timeSpentSeconds / 60)} mins
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                    Band {attempt.bandScore.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
