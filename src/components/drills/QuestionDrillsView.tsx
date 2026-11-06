import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QUESTION_STRATEGIES, DRILL_QUESTIONS_BANK } from '../../data/questionDrills';
import { QuestionType, SkillModule, UserStats } from '../../types/ielts';

interface QuestionDrillsViewProps {
  userStats: UserStats;
  activeDrillType: QuestionType;
  onSelectDrillType: (type: QuestionType) => void;
  onRecordResult: (type: QuestionType, correct: number, total: number) => void;
}

export const QuestionDrillsView: React.FC<QuestionDrillsViewProps> = ({
  userStats,
  activeDrillType,
  onSelectDrillType,
  onRecordResult,
}) => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<SkillModule | 'all'>('all');
  const [showStrategySheet, setShowStrategySheet] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const currentStrategy = QUESTION_STRATEGIES[activeDrillType];
  const questions = DRILL_QUESTIONS_BANK[activeDrillType] || [];

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitDrill = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
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

    onRecordResult(activeDrillType, correct, questions.length);
  };

  const handleResetDrill = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const drillTypesList: QuestionType[] = [
    'multiple_choice',
    'fill_in_the_blank',
    'matching_headings',
    'true_false_not_given',
    'map_labelling',
    'matching_features',
    'summary_completion',
    'writing_task1',
    'writing_task2',
    'speaking_cue_card',
  ];

  const filteredTypes = drillTypesList.filter((type) => {
    const strat = QUESTION_STRATEGIES[type];
    if (selectedModuleFilter === 'all') return true;
    return strat.module === selectedModuleFilter;
  });

  // Calculate score
  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
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
    return { correct, total: questions.length };
  };

  const drillScore = submitted ? getScore() : null;

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden">
      {/* Top Module Category Pills */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Targeted Question Drills
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['all', 'listening', 'reading', 'writing', 'speaking'] as const).map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModuleFilter(mod)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                selectedModuleFilter === mod
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Type Sidebar & Drill Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drill Type Selector List */}
        <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
            Question Types ({filteredTypes.length})
          </div>

          {filteredTypes.map((type) => {
            const strat = QUESTION_STRATEGIES[type];
            const isSelected = activeDrillType === type;
            const accuracy = userStats.questionTypeAccuracy[type];
            const pct = accuracy && accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0;

            return (
              <button
                key={type}
                onClick={() => {
                  onSelectDrillType(type);
                  setSubmitted(false);
                  setAnswers({});
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`font-semibold truncate ${
                      isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {strat.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {strat.module.slice(0, 4)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Accuracy: {pct}%</span>
                  <span className="font-mono">{accuracy?.total || 0} practiced</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Workspace: Strategy Guide + Drill Runner */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-5">
          {/* Strategy Tip Sheet Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {currentStrategy.title} — Cambridge Strategy Blueprint
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                  {currentStrategy.difficulty}
                </span>
              </div>

              <button
                onClick={() => setShowStrategySheet((prev) => !prev)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                {showStrategySheet ? 'Collapse Tips' : 'Show Tips'}
                {showStrategySheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showStrategySheet && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Examiner Traps to Avoid
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {currentStrategy.commonTraps.map((trap, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {trap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recommended Step-by-Step Method
                  </span>
                  <ol className="space-y-1 text-slate-600 dark:text-slate-400 list-decimal list-inside">
                    {currentStrategy.stepByStepMethod.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Drill Result Card (if submitted) */}
          {submitted && drillScore && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                  {drillScore.correct}/{drillScore.total}
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                    Drill Completed!
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Accuracy updated in your Improvement Diagnostic Radar.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mr-2">
                  <Award className="w-4 h-4" /> +{drillScore.correct * 15} XP
                </span>
                <button
                  onClick={handleResetDrill}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Retry Drill
                </button>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = answers[q.id] || '';
              let isCorrect = false;
              if (submitted) {
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
                    submitted
                      ? isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                      Question {idx + 1} of {questions.length}
                    </span>

                    {submitted && (
                      <span className="text-xs font-bold flex items-center gap-1">
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

                  {q.instruction && (
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                      {q.instruction}
                    </div>
                  )}

                  <div className="text-xs md:text-sm text-slate-900 dark:text-slate-100 mb-4 whitespace-pre-line leading-relaxed">
                    {q.prompt}
                  </div>

                  {/* MCQ Options */}
                  {q.options && (
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt) => {
                        const optKey = opt.charAt(0);
                        const isSelected = userAns.toUpperCase() === optKey;

                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-semibold text-blue-900 dark:text-blue-100 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`drill-q-${q.id}`}
                              value={optKey}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(q.id, optKey)}
                              className="text-blue-600 w-4 h-4"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input (Fill in the blanks / Writing thesis) */}
                  {!q.options && (
                    <div className="mb-3 max-w-xl">
                      <input
                        type="text"
                        placeholder="Type answer here..."
                        value={userAns}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Submission Feedback & Distractor Notes */}
                  {submitted && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Correct Answer:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drill Action Bottom Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleResetDrill}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Answers
            </button>

            <button
              onClick={handleSubmitDrill}
              disabled={submitted}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Check Drill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
