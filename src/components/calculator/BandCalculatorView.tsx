import React, { useState } from 'react';
import { Calculator, Award, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import {
  rawToBand,
  calculateOverallBand,
  formatBand,
  getBandDescriptor,
} from '../../utils/scoring';

export const BandCalculatorView: React.FC = () => {
  const [listeningRaw, setListeningRaw] = useState<number>(30);
  const [readingRaw, setReadingRaw] = useState<number>(27);
  const [isAcademic, setIsAcademic] = useState<boolean>(true);
  const [writingBand, setWritingBand] = useState<number>(6.5);
  const [speakingBand, setSpeakingBand] = useState<number>(6.5);

  const listeningBand = rawToBand(listeningRaw, 'listening');
  const readingBand = rawToBand(readingRaw, 'reading', isAcademic);
  const overallBand = calculateOverallBand(
    listeningBand,
    readingBand,
    writingBand,
    speakingBand
  );
  const descriptor = getBandDescriptor(overallBand);

  // Exact mean before rounding
  const exactMean = (listeningBand + readingBand + writingBand + speakingBand) / 4;

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">
                Official IELTS Band Score Calculator
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accurately converts raw test marks (0–40) into band scores using Cambridge / IDP criteria
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setIsAcademic(true)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                isAcademic
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setIsAcademic(false)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                !isAcademic
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              General Training
            </button>
          </div>
        </div>

        {/* Primary Result Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Official Composite IELTS Result
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-5xl font-black font-mono">
                Band {formatBand(overallBand)}
              </span>
              <span className="text-sm text-blue-200 font-mono">
                (Raw Mean: {exactMean.toFixed(2)})
              </span>
            </div>
            <p className="text-xs text-blue-100 max-w-md pt-1">
              {descriptor.title} ({descriptor.cefr}) — {descriptor.summary}
            </p>
          </div>

          {/* Official Rounding Logic Explanation */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs space-y-1.5 max-w-xs shrink-0">
            <div className="font-bold flex items-center gap-1.5 text-blue-100">
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Official Rounding Rule</span>
            </div>
            <p className="text-[11px] text-blue-200 leading-relaxed">
              If the mean ends in .25, it rounds UP to the next half band (.5). If it ends in .75, it rounds UP to the next whole band (1.0).
            </p>
          </div>
        </div>

        {/* 4 Skills Input Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Listening Input Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Listening (40 Questions)
                </span>
                <div className="text-[11px] text-slate-500">Raw Correct Answers</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                  Band {formatBand(listeningBand)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">0</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {listeningRaw} / 40
                </span>
                <span className="text-slate-500">40</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={listeningRaw}
                onChange={(e) => setListeningRaw(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Reading Input Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAcademic ? 'Academic' : 'General'} Reading (40 Questions)
                </span>
                <div className="text-[11px] text-slate-500">Raw Correct Answers</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                  Band {formatBand(readingBand)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">0</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {readingRaw} / 40
                </span>
                <span className="text-slate-500">40</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={readingRaw}
                onChange={(e) => setReadingRaw(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Writing Input Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Writing (Task 1 & Task 2)
                </span>
                <div className="text-[11px] text-slate-500">Evaluated Band Score</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  Band {formatBand(writingBand)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">4.0</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {writingBand.toFixed(1)}
                </span>
                <span className="text-slate-500">9.0</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={9.0}
                step={0.5}
                value={writingBand}
                onChange={(e) => setWritingBand(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Speaking Input Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Speaking (Parts 1, 2, 3)
                </span>
                <div className="text-[11px] text-slate-500">Evaluated Band Score</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  Band {formatBand(speakingBand)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">4.0</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {speakingBand.toFixed(1)}
                </span>
                <span className="text-slate-500">9.0</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={9.0}
                step={0.5}
                value={speakingBand}
                onChange={(e) => setSpeakingBand(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
