import React, { useState } from 'react';
import {
  PenTool,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Wand2,
  Filter,
  Eye,
  Edit3,
} from 'lucide-react';

export interface WritingImprovementItem {
  id: string;
  type: 'grammar' | 'vocabulary';
  originalExcerpt: string;
  suggestion: string;
  reason: string;
  improvedVersion: string;
}

export interface WritingEvaluationResult {
  source: string;
  overallBand: number;
  scores: {
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalAccuracy: number;
  };
  examinerSummary: string;
  strengths: string[];
  improvements: WritingImprovementItem[];
  bandBoosterAdvice: string[];
  metrics: {
    wordCount: number;
    targetWords: number;
    isLengthSatisfied: boolean;
    paragraphCount: number;
  };
}

export const WritingStudioView: React.FC = () => {
  const [activeTask, setActiveTask] = useState<1 | 2>(2);
  const [task1Text, setTask1Text] = useState<string>('');
  const [task2Text, setTask2Text] = useState<string>('');
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<WritingEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Workspace Mode: 'editor' (raw textarea) vs 'inspection' (interactive highlights) vs 'report' (scores & rubric)
  const [viewMode, setViewMode] = useState<'editor' | 'inspection' | 'report'>('editor');
  const [selectedAnnotation, setSelectedAnnotation] = useState<WritingImprovementItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'grammar' | 'vocabulary'>('all');
  const [acceptedAnnotationIds, setAcceptedAnnotationIds] = useState<Set<string>>(new Set());

  const task1Prompt = {
    title: 'Academic Writing Task 1: Renewable Energy Production (2015–2025)',
    description:
      'The chart below shows renewable energy generation across wind, solar, and hydroelectric sources in northern Europe between 2015 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    minWords: 150,
    modelAnswer:
      'The line graph compares the volume of electrical energy generated from three renewable sources—wind, solar, and hydroelectric—in northern Europe over a ten-year timeframe from 2015 to 2025.\n\nOverall, renewable energy output witnessed a pronounced upward trajectory across all three sectors, with solar energy exhibiting the most dramatic proportional expansion, while hydroelectric generation remained the dominant single contributor throughout the period.\n\nIn 2015, hydroelectric power began at roughly 120 terawatt-hours (TWh), far outstripping wind (45 TWh) and solar (15 TWh). Over the subsequent decade, hydroelectric capacity rose steadily to plateau at approximately 160 TWh by 2025.\n\nIn stark contrast, solar power experienced an exponential surge, climbing from a modest 15 TWh in 2015 to exceed 110 TWh in 2025, thereby eclipsing wind energy by 2023. Wind power also demonstrated consistent growth, rising steadily to culminate at 95 TWh.',
  };

  const task2Prompt = {
    title: 'Academic Writing Task 2: Automation & Future of Work',
    description:
      'Some people believe that artificial intelligence and automation will replace human labor and create widespread unemployment. Others argue that technological shifts will generate new, more creative professions.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.',
    minWords: 250,
    modelAnswer:
      'The rapid proliferation of artificial intelligence and automated cognitive systems has provoked intense debate regarding the future of the global labor force. While critics contend that automation will precipitate systemic redundancies and exacerbate socioeconomic inequality, I firmly believe that technological revolutions historically displace manual tasks while spawning higher-value, intellectually creative industries.\n\nOn the one hand, those who anticipate widespread joblessness cite the unprecedented speed at which autonomous algorithms now execute complex analytical procedures. In sectors such as clerical administration, data entry, and transportation, automated software executes routine tasks with superior speed and zero physical fatigue. Consequently, workers without technical reskilling face immediate obsolescence, creating localized economic dislocation.\n\nNevertheless, historical precedent illustrates that disruption inevitably heralds new occupational frontiers. When industrial mechanization transformed 19th-century agriculture, millions shifted into engineering, design, and education. Similarly, the contemporary expansion of artificial intelligence is fostering brand-new domains, including bioethics consulting, machine learning oversight, and empathetic elder care. Furthermore, human traits such as contextual judgment, emotional intelligence, and genuine artistic ingenuity remain fundamentally unreplicable by algorithmic calculation.\n\nIn conclusion, while the transition period necessitates proactive state-led educational retraining programs, automation should be embraced as a tool that liberates human talent from repetitive toil rather than a harbinger of permanent unemployment.',
  };

  const currentPrompt = activeTask === 1 ? task1Prompt : task2Prompt;
  const currentText = activeTask === 1 ? task1Text : task2Text;
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const isWordTargetMet = wordCount >= currentPrompt.minWords;

  const handleTextChange = (val: string) => {
    if (activeTask === 1) setTask1Text(val);
    else setTask2Text(val);
    if (errorMessage) setErrorMessage(null);
  };

  const handleLoadSampleDraft = () => {
    const sample =
      activeTask === 1
        ? 'The provided line graph illustrates the amount of renewable electricity produced from wind, solar, and hydro power in Northern Europe between 2015 and 2025.\n\nOverall, it is clear that energy production increased in all three categories over the ten-year period. Hydroelectric power was the largest source in every single year, while solar power showed the fastest growth.\n\nIn 2015, hydroelectric generation started high at around 120 TWh, which was much higher than wind (45 TWh) and solar power (15 TWh). By 2025, hydro power grew gradually to finish at about 160 TWh.\n\nOn the other hand, solar energy grew rapidly from 15 TWh to over 110 TWh, passing wind power around 2023. Wind power also had steady growth, ending up at 95 TWh in 2025.'
        : 'Nowadays, there is a big debate about whether artificial intelligence and modern technology will take away jobs or create new opportunities for workers.\n\nSome people worry that AI will cause massive unemployment. Robots and algorithms can do routine work much faster than human beings without needing rest or payment. For instance in factories and customer support, computers are replacing workers quickly. As a result, ordinary people might lose their livelihoods.\n\nHowever, other people believe that technology brings new types of jobs. In the past, when machines were invented for farming, people moved to cities and worked in new industries like engineering and transportation. In the same way, AI will need programmers, ethical regulators, and human managers. Moreover, machines cannot copy human creativity, empathy, and critical thinking.\n\nIn conclusion while automation will change the job market and require retraining, I believe it will create more creative and interesting careers in the long run.';
    handleTextChange(sample);
  };

  const handleCheckWriting = async () => {
    if (wordCount < 15) {
      setErrorMessage(`Please write at least 15-20 words before requesting AI evaluation (current: ${wordCount} words).`);
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);
    setSelectedAnnotation(null);

    try {
      const response = await fetch('/api/ielts/evaluate/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: activeTask,
          text: currentText,
          minWords: currentPrompt.minWords,
          promptTitle: currentPrompt.title,
          promptDescription: currentPrompt.description,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Evaluation failed. Please try again.');
      }

      setEvaluationResult(data);
      setViewMode('inspection');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with examiner evaluation engine.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // One-click Accept & Replace Handler
  const handleAcceptImprovement = (item: WritingImprovementItem) => {
    const original = item.originalExcerpt.trim();
    const replacement = item.improvedVersion.trim();

    if (!original || !currentText.includes(original)) {
      // If exact string not found, try case-insensitive replace
      const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const updated = currentText.replace(regex, replacement);
      handleTextChange(updated);
    } else {
      const updated = currentText.replace(original, replacement);
      handleTextChange(updated);
    }

    setAcceptedAnnotationIds((prev) => new Set(prev).add(item.id));
    setSelectedAnnotation(null);
  };

  // Render Interactive Annotated Text
  const renderAnnotatedText = () => {
    if (!evaluationResult || !evaluationResult.improvements) {
      return <div className="whitespace-pre-line">{currentText}</div>;
    }

    const activeImprovements = evaluationResult.improvements.filter((imp) => {
      if (filterType === 'all') return true;
      return imp.type === filterType;
    });

    const paragraphs = currentText.split('\n');

    return (
      <div className="space-y-4 font-sans text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200 select-text">
        {paragraphs.map((para, pIndex) => {
          if (!para.trim()) return <div key={pIndex} className="h-2" />;

          // Find annotations present in this paragraph
          const matchedAnnotations: { item: WritingImprovementItem; start: number; end: number }[] = [];

          activeImprovements.forEach((item) => {
            const searchPhrase = item.originalExcerpt.trim();
            if (!searchPhrase) return;
            const pos = para.indexOf(searchPhrase);
            if (pos !== -1) {
              matchedAnnotations.push({
                item,
                start: pos,
                end: pos + searchPhrase.length,
              });
            }
          });

          // Sort by start index
          matchedAnnotations.sort((a, b) => a.start - b.start);

          // Build slice fragments
          const fragments: React.ReactNode[] = [];
          let lastIndex = 0;

          matchedAnnotations.forEach(({ item, start, end }) => {
            if (start < lastIndex) return; // avoid overlapping conflicts

            if (start > lastIndex) {
              fragments.push(para.substring(lastIndex, start));
            }

            const isAccepted = acceptedAnnotationIds.has(item.id);
            const isGrammar = item.type === 'grammar';
            const isSelected = selectedAnnotation?.id === item.id;

            fragments.push(
              <span
                key={`${item.id}-${start}`}
                onClick={() => setSelectedAnnotation(item)}
                className={`relative inline-block cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                  isAccepted
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-b-2 border-emerald-500'
                    : isGrammar
                    ? isSelected
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 border-b-2 border-rose-600 ring-2 ring-rose-400/50'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-b-2 border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                    : isSelected
                    ? 'bg-violet-200 dark:bg-violet-900 text-violet-950 dark:text-violet-100 border-b-2 border-violet-600 ring-2 ring-violet-400/50'
                    : 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border-b-2 border-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/60'
                }`}
                title={`Click to view ${isGrammar ? 'grammar correction' : 'vocabulary upgrade'}`}
              >
                {para.substring(start, end)}
                {isAccepted && (
                  <Check className="inline-block w-3 h-3 text-emerald-600 ml-1" />
                )}
              </span>
            );

            lastIndex = end;
          });

          if (lastIndex < para.length) {
            fragments.push(para.substring(lastIndex));
          }

          return <p key={pIndex}>{fragments}</p>;
        })}
      </div>
    );
  };

  const grammarIssuesCount =
    evaluationResult?.improvements?.filter((i) => i.type === 'grammar').length || 0;
  const vocabIssuesCount =
    evaluationResult?.improvements?.filter((i) => i.type === 'vocabulary').length || 0;

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden relative">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            CDT Writing Studio & AI Evaluator
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Task 1 / Task 2 Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => {
                setActiveTask(1);
                setShowModelAnswer(false);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTask === 1
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Task 1 (150w)
            </button>
            <button
              onClick={() => {
                setActiveTask(2);
                setShowModelAnswer(false);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTask === 2
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Task 2 (250w)
            </button>
          </div>

          {/* Quick Draft Loader for Testing */}
          <button
            onClick={handleLoadSampleDraft}
            className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            title="Load sample essay draft"
          >
            Load Sample Draft
          </button>

          {/* Primary Action: Check Writing */}
          <button
            onClick={handleCheckWriting}
            disabled={isEvaluating}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Essay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate & Highlight Errors</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Official Prompt & Rubric */}
        <div className="w-80 md:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Exam Prompt
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {currentPrompt.title}
              </h2>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentPrompt.description}
            </div>

            {/* IELTS 4-Criteria Rubric Checklist */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
                Cambridge 4-Criteria Rubric
              </span>
              <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span>Task Achievement / Response (TR)</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">Fully address all parts of prompt with a sustained, clear position.</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span>Coherence & Cohesion (CC)</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">Logical paragraph structure with varied, natural transition devices.</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span>Lexical Resource (LR)</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">Sophisticated academic collocations, precision, and low-frequency terms.</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span>Grammatical Range & Accuracy (GRA)</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">Wide mix of complex sentences with error-free grammar and punctuation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setShowModelAnswer((prev) => !prev)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showModelAnswer ? 'Return to Writing' : 'View Band 8.5 Model Answer'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Editor & Interactive Inspection */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 p-4 md:p-5 overflow-hidden relative">
          {/* Subheader: Word Count + Mode Selector */}
          <div className="flex items-center justify-between mb-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Word Count:
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isWordTargetMet
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {wordCount} / {currentPrompt.minWords} words
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700">·</span>

              <div className="text-xs">
                {isWordTargetMet ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Minimum Target Met
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Needs {Math.max(0, currentPrompt.minWords - wordCount)} words
                  </span>
                )}
              </div>
            </div>

            {/* View Mode Selector */}
            {evaluationResult && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    viewMode === 'editor'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Raw Editor</span>
                </button>
                <button
                  onClick={() => setViewMode('inspection')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    viewMode === 'inspection'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inline Highlights</span>
                </button>
                <button
                  onClick={() => setViewMode('report')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    viewMode === 'report'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Band {evaluationResult.overallBand.toFixed(1)}</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Filter Bar in Inline Highlights Mode */}
          {viewMode === 'inspection' && evaluationResult && (
            <div className="mb-3 flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Estimated Score:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold font-mono">
                  Band {evaluationResult.overallBand.toFixed(1)}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-[11px] text-slate-500">
                  Click any highlighted phrase to view correction & accept Band 8+ replacement
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({grammarIssuesCount + vocabIssuesCount})
                </button>
                <button
                  onClick={() => setFilterType('grammar')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    filterType === 'grammar'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Grammar ({grammarIssuesCount})</span>
                </button>
                <button
                  onClick={() => setFilterType('vocabulary')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                    filterType === 'vocabulary'
                      ? 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200'
                      : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>Vocabulary ({vocabIssuesCount})</span>
                </button>
              </div>
            </div>
          )}

          {/* Model Answer Drawer */}
          {showModelAnswer ? (
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Cambridge Examiner Benchmark (Band 8.5 Model Response)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentPrompt.modelAnswer.split(/\s+/).length} words
                </span>
              </div>
              <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {currentPrompt.modelAnswer}
              </div>
            </div>
          ) : viewMode === 'inspection' && evaluationResult ? (
            /* INTERACTIVE INLINE HIGHLIGHTS VIEW */
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative">
              {renderAnnotatedText()}
            </div>
          ) : viewMode === 'report' && evaluationResult ? (
            /* EXAMINER EVALUATION & SCORES REPORT */
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              {/* Score Header Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      IELTS Writing Diagnostic Result
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      {evaluationResult.source === 'gemini_examiner' ? 'AI Examiner Graded' : 'Rubric Verified'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Estimated Overall: Band {evaluationResult.overallBand.toFixed(1)}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                    {evaluationResult.examinerSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-blue-200">Band</span>
                    <span className="text-2xl font-black font-mono leading-none mt-0.5">
                      {evaluationResult.overallBand.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-blue-200 mt-1">out of 9.0</span>
                  </div>
                </div>
              </div>

              {/* 4 Official Criteria Scores */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Task Response
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    Band {evaluationResult.scores.taskAchievement.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {evaluationResult.metrics.isLengthSatisfied ? 'Length requirement met' : 'Under target words'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Coherence & Cohesion
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    Band {evaluationResult.scores.coherenceCohesion.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {evaluationResult.metrics.paragraphCount} paragraphs detected
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Lexical Resource
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    Band {evaluationResult.scores.lexicalResource.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Academic vocabulary & collocations</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Grammatical Range
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    Band {evaluationResult.scores.grammaticalAccuracy.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Complex structures & accuracy</span>
                </div>
              </div>

              {/* Strengths */}
              {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Candidate Strengths Demonstrated</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {evaluationResult.strengths.map((str, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300"
                      >
                        {str}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Band Booster Strategy Checklist */}
              {evaluationResult.bandBoosterAdvice && evaluationResult.bandBoosterAdvice.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>How to Gain +0.5 to +1.0 Band on This Essay</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-blue-800 dark:text-blue-300">
                    {evaluationResult.bandBoosterAdvice.map((advice, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* RAW TEXTAREA EDITOR */
            <textarea
              placeholder={`Write your ${
                activeTask === 1 ? '150-word Task 1 response' : '250-word Task 2 essay'
              } here under Cambridge exam conditions...\n\nClick "Evaluate & Highlight Errors" above to receive interactive inline annotations for grammar mistakes and vocabulary upgrades, complete with one-click replacements and 4-criteria band scoring.`}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="flex-1 w-full p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-none shadow-2xs"
            />
          )}

          {/* CLICKABLE SUGGESTION POPOVER MODAL */}
          {selectedAnnotation && (
            <div className="absolute bottom-6 right-8 left-8 sm:left-auto sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      selectedAnnotation.type === 'grammar'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300'
                    }`}
                  >
                    {selectedAnnotation.type === 'grammar' ? 'Grammar Correction' : 'Vocabulary Upgrade (Band 8+)'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2.5 space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {selectedAnnotation.suggestion}
                </div>

                {/* Before / After Preview */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold uppercase text-rose-500 shrink-0 mt-0.5">
                      Original:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 line-through">
                      &ldquo;{selectedAnnotation.originalExcerpt}&rdquo;
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 shrink-0 mt-0.5">
                      Band 8+:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      &ldquo;{selectedAnnotation.improvedVersion}&rdquo;
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Examiner Rationale:</strong> {selectedAnnotation.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Dismiss
                </button>

                <button
                  onClick={() => handleAcceptImprovement(selectedAnnotation)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Accept & Replace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
