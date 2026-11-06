import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Headphones,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  PenTool,
  Mic,
  Trophy,
} from 'lucide-react';
import { INITIAL_MILESTONES } from '../../data/milestones';
import { MilestoneNode, UserStats } from '../../types/ielts';

interface MilestoneJourneyViewProps {
  userStats: UserStats;
  onCompleteMilestone: (id: string) => void;
  onNavigateToModule: (view: any) => void;
}

export const MilestoneJourneyView: React.FC<MilestoneJourneyViewProps> = ({
  userStats,
  onCompleteMilestone,
  onNavigateToModule,
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneNode>(INITIAL_MILESTONES[1]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Headphones':
        return Headphones;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'BookOpen':
        return BookOpen;
      case 'GraduationCap':
        return GraduationCap;
      case 'PenTool':
        return PenTool;
      case 'Mic':
        return Mic;
      case 'Trophy':
      default:
        return Trophy;
    }
  };

  const completedCount = INITIAL_MILESTONES.filter(
    (m) => m.isCompleted || userStats.unlockedMilestones.includes(m.id)
  ).length;

  const progressPercentage = Math.round((completedCount / INITIAL_MILESTONES.length) * 100);

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Animated IELTS Milestone Journey
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guided progression roadmap from Foundation (Band 5.5) to Target (Band {userStats.targetBand.toFixed(1)})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{userStats.streakDays} Day Practice Streak</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-mono">{userStats.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Visual Winding Path */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          {/* Progress Overview Bar */}
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-8 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Overall Milestone Progress</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {completedCount} of {INITIAL_MILESTONES.length} Completed ({progressPercentage}%)
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Interactive Winding Nodes */}
          <div className="w-full max-w-2xl space-y-6 relative pb-12">
            {/* Visual connecting track */}
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-800 -z-0" />

            {INITIAL_MILESTONES.map((milestone, idx) => {
              const isCompleted =
                milestone.isCompleted || userStats.unlockedMilestones.includes(milestone.id);
              const isCurrent =
                !isCompleted &&
                (idx === 0 ||
                  INITIAL_MILESTONES[idx - 1].isCompleted ||
                  userStats.unlockedMilestones.includes(INITIAL_MILESTONES[idx - 1].id));
              const isLocked = !isCompleted && !isCurrent;
              const isSelected = selectedMilestone?.id === milestone.id;

              const Icon = getIcon(milestone.iconName);

              return (
                <div
                  key={milestone.id}
                  onClick={() => setSelectedMilestone(milestone)}
                  className={`relative z-10 flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 hover:border-blue-400 shadow-xs'
                      : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Status Circle Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-md animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Milestone Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {milestone.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          Target Band {milestone.targetBand.toFixed(1)}
                        </span>
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          +{milestone.xpReward} XP
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checkpoint Cleared
                        </span>
                      ) : isCurrent ? (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          ● Active Objective (Click to View Tasks)
                        </span>
                      ) : (
                        <span className="text-slate-400">Complete prior milestones to unlock</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Milestone Inspector & Task Checklist */}
        <div className="w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                Milestone Inspector
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedMilestone.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedMilestone.description}
              </p>
            </div>

            {/* Target Band Metric Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Target Benchmark</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                  Band {selectedMilestone.targetBand.toFixed(1)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Completion Reward</div>
                <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                  <Award className="w-4 h-4" />
                  <span>+{selectedMilestone.xpReward} XP</span>
                </div>
              </div>
            </div>

            {/* Required Tasks Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                Required Milestone Tasks
              </h4>
              <div className="space-y-2">
                {selectedMilestone.requiredTasks.map((task, tIdx) => {
                  const isCompleted =
                    selectedMilestone.isCompleted ||
                    userStats.unlockedMilestones.includes(selectedMilestone.id);

                  return (
                    <div
                      key={tIdx}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isCompleted
                            ? 'text-emerald-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span className="leading-relaxed">{task}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {userStats.unlockedMilestones.includes(selectedMilestone.id) ||
            selectedMilestone.isCompleted ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs text-center border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Milestone Already Cleared!</span>
              </div>
            ) : (
              <button
                onClick={() => onCompleteMilestone(selectedMilestone.id)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Verify & Claim Milestone</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigateToModule(selectedMilestone.skill === 'all' ? 'mock' : selectedMilestone.skill)}
              className="w-full mt-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Jump to Related Module Practice</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
