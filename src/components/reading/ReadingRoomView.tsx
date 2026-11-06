import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Highlighter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  HelpCircle,
  X,
  ChevronRight,
  Flag,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Loader2,
  BookMarked,
  Trash2,
  Copy,
  Check,
  Languages,
} from 'lucide-react';
import { lookupWordDefinition, cleanWordToken, DictionaryEntry } from '../../utils/dictionary';

interface ReadingRoomViewProps {
  onAddXp?: (xp: number) => void;
}

interface QuickDefineTooltipState {
  word: string;
  x: number;
  y: number;
  entry: DictionaryEntry | null;
  loading: boolean;
}

export const ReadingRoomView: React.FC<ReadingRoomViewProps> = ({ onAddXp }) => {
  const [fontSize, setFontSize] = useState<number>(15);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const [banglaAssistMode, setBanglaAssistMode] = useState<boolean>(true);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isQuestionDrawerOpen, setIsQuestionDrawerOpen] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Quick-Define Dictionary Tooltip state
  const [tooltip, setTooltip] = useState<QuickDefineTooltipState | null>(null);
  const [savedVocab, setSavedVocab] = useState<DictionaryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ielts_saved_vocab');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false);
  const [copiedWord, setCopiedWord] = useState<boolean>(false);
  const passageRef = useRef<HTMLDivElement>(null);

  // Sync saved vocab to localStorage
  useEffect(() => {
    localStorage.setItem('ielts_saved_vocab', JSON.stringify(savedVocab));
  }, [savedVocab]);

  // Global Esc key shortcut for Tooltip, Drawer, and Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (tooltip) {
          setTooltip(null);
        } else if (isVocabModalOpen) {
          setIsVocabModalOpen(false);
        } else if (isQuestionDrawerOpen) {
          setIsQuestionDrawerOpen(false);
        } else {
          setIsFocusMode((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tooltip, isVocabModalOpen, isQuestionDrawerOpen]);

  // Handle double-click word selection in the passage
  const handlePassageDoubleClick = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const rawWord = selection.toString();
    const clean = cleanWordToken(rawWord);
    if (!clean || clean.length < 2) return;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const tooltipWidth = 330;
      const tooltipHeight = 220;

      // Center horizontally relative to selected word
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      x = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, x));

      // Position above the selection by default, below if too close to viewport top
      let y = rect.top - tooltipHeight - 12;
      if (y < 60) {
        y = rect.bottom + 12;
      }

      setTooltip({
        word: clean,
        x,
        y,
        entry: null,
        loading: true,
      });

      const entry = await lookupWordDefinition(clean);
      setTooltip((prev) => (prev && prev.word === clean ? { ...prev, entry, loading: false } : prev));
    } catch (err) {
      console.error('Error opening quick-define tooltip:', err);
    }
  };

  // Audio pronunciation handler
  const handlePronounce = (word: string, audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => speakBrowserTts(word));
    } else {
      speakBrowserTts(word);
    }
  };

  const speakBrowserTts = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-GB'; // British English for IELTS standard
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save/remove word from user's vocabulary notebook
  const handleToggleSaveVocab = (entry: DictionaryEntry) => {
    setSavedVocab((prev) => {
      const exists = prev.some((v) => v.word.toLowerCase() === entry.word.toLowerCase());
      if (exists) {
        return prev.filter((v) => v.word.toLowerCase() !== entry.word.toLowerCase());
      } else {
        if (onAddXp) onAddXp(10);
        return [entry, ...prev];
      }
    });
  };

  const isWordSaved = (word: string) => {
    return savedVocab.some((v) => v.word.toLowerCase() === word.toLowerCase());
  };

  const handleCopy = (word: string) => {
    navigator.clipboard?.writeText(word);
    setCopiedWord(true);
    setTimeout(() => setCopiedWord(false), 1500);
  };

  const passage = {
    title: 'The Andean Agricultural Terraces: Ancient Microclimate Engineering',
    paragraphs: [
      {
        id: 'A',
        text: 'Across the steep, frost-prone slopes of the central Andes, ancient pre-Columbian agriculturalists faced severe environmental hazards: thin high-altitude atmospheres, torrential rainstorms, and sub-zero nighttime frosts. To counter these vulnerabilities, civilizations including the Wari and Inca constructed monumental stone-walled agricultural terraces, known regionally as andenes. These structures transformed vertical mountain slopes into stepped agricultural platforms, fundamentally altering Andean food security.',
      },
      {
        id: 'B',
        text: 'Engineering investigations demonstrate that andenes were far more than simple soil retaining walls. Excavations reveal a sophisticated multi-layered drainage foundation. The bottom layer comprised large basalt boulders, overlain by coarse river gravel, fine sand, and finally rich organic topsoil imported from lower river valleys. This stratification prevented waterlogging during torrential monsoons while retaining adequate moisture during prolonged droughts.',
      },
      {
        id: 'C',
        text: 'Crucially, the massive thermal mass of the dark stone retaining walls served as passive solar collectors. During intense daytime equatorial sunlight, the stones absorbed substantial heat. As ambient temperatures plummeted rapidly after sunset, the walls gradually radiated this captured thermal energy back into the soil and adjacent air, raising the terrace microclimate by between two and three degrees Celsius—a critical margin that prevented crop damage from lethal night frosts.',
      },
    ],
    questions: [
      {
        number: 1,
        type: 'matching_headings',
        instruction: 'Choose the correct heading for Paragraph B.',
        prompt: 'Which heading best describes Paragraph B?',
        options: [
          'i. Multi-tiered structural layering and drainage design',
          'ii. Decline of agricultural output following the Spanish conquest',
          'iii. Astronomical alignments in stone wall orientation',
        ],
        correctAnswer: 'i',
        explanation: 'Paragraph B explains the multi-layered foundation: boulders, gravel, sand, and topsoil preventing waterlogging and retaining moisture.',
      },
      {
        number: 2,
        type: 'true_false_not_given',
        instruction: 'Write TRUE, FALSE, or NOT GIVEN.',
        prompt: 'Statement: The andenes were first developed solely during the Inca imperial reign.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'The text states civilizations including the Wari (who preceded the Inca) constructed them.',
      },
      {
        number: 3,
        type: 'true_false_not_given',
        instruction: 'Write TRUE, FALSE, or NOT GIVEN.',
        prompt: 'Statement: Dark stone terrace walls raised the local night microclimate by up to three degrees Celsius.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'The text confirms the walls radiated heat, "raising the terrace microclimate by between two and three degrees Celsius".',
      },
      {
        number: 4,
        type: 'fill_in_the_blank',
        instruction: 'Write ONE WORD ONLY from the passage.',
        prompt: 'The lowest stratum of the terrace foundation was composed of basalt [ 4 ].',
        correctAnswer: 'boulders',
        explanation: 'Paragraph B explicitly states: "The bottom layer comprised large basalt boulders".',
      },
    ],
  };

  const handleAnswer = (num: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [num]: val }));
  };

  const handleToggleFlag = (num: number) => {
    setFlagged((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correct = 0;
    passage.questions.forEach((q) => {
      const u = (answers[q.number] || '').trim().toLowerCase();
      if (q.correctAnswer.trim().toLowerCase() === u) {
        correct++;
      }
    });
    if (onAddXp) {
      onAddXp(correct * 20);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
  };

  const answeredCount = Object.keys(answers).filter((k) => (answers[Number(k)] || '').trim().length > 0).length;

  const renderQuestionsList = () => (
    <div className="space-y-4">
      {passage.questions.map((q) => {
        const userAns = answers[q.number] || '';
        const isCorrect = isSubmitted && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        const isFlagged = !!flagged[q.number];

        return (
          <div
            key={q.number}
            className={`p-4 rounded-2xl border transition-all ${
              isSubmitted
                ? isCorrect
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono flex items-center justify-center">
                  {q.number}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  {q.type.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleFlag(q.number)}
                  className={`p-1 rounded text-xs transition-colors ${
                    isFlagged ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={isFlagged ? 'Flagged for review' : 'Flag question'}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-current' : ''}`} />
                </button>

                {isSubmitted && (
                  <span className="text-xs font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              {q.instruction}
            </div>
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-3">
              {q.prompt}
            </div>

            {q.options && (
              <div className="space-y-1.5">
                {q.options.map((opt) => {
                  const optKey = opt.split('.')[0].trim();
                  const isSelected = userAns.toUpperCase() === optKey.toUpperCase();

                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`read-q-${q.number}`}
                        checked={isSelected}
                        onChange={() => handleAnswer(q.number, optKey)}
                        className="text-blue-600 w-3.5 h-3.5"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {!q.options && (
              <input
                type="text"
                placeholder="Type your answer..."
                value={userAns}
                onChange={(e) => handleAnswer(q.number, e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            )}

            {isSubmitted && (
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Answer: {q.correctAnswer}
                </span>
                <p className="mt-1">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {isFocusMode ? 'Reading Focus Mode (Full Screen)' : 'CDT Reading Simulator — Split View'}
          </span>
          {isFocusMode && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              Distraction-Free
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Vocab Notebook Button */}
          <button
            onClick={() => setIsVocabModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Open saved vocabulary notebook"
          >
            <BookMarked className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Vocabulary</span>
            {savedVocab.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {savedVocab.length}
              </span>
            )}
          </button>

          {/* Highlighter toggle */}
          <button
            onClick={() => setHighlightMode((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              highlightMode
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle paragraph highlight mode"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlighter</span>
          </button>

          {/* Bangla Translation Assist Toggle */}
          <button
            onClick={() => setBanglaAssistMode((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              banglaAssistMode
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle instant Bengali word translation popover"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>বাংলা {banglaAssistMode ? 'অন' : 'অফ'}</span>
          </button>

          {/* Font resizer */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
              title="Decrease font size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-500">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
              title="Increase font size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Focus Mode Toggle Button */}
          <button
            onClick={() => setIsFocusMode((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isFocusMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Reading Focus Mode (Esc)"
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? 'Exit Focus (Esc)' : 'Focus Mode (Esc)'}</span>
          </button>

          {!isFocusMode && (
            <button
              onClick={handleSubmit}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check Answers</span>
            </button>
          )}
        </div>
      </div>

      {/* Helper Banner for Double-Click Dictionary */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200/60 dark:border-blue-900/40 px-4 py-1.5 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Dictionary Activated:</strong> Double-click any word in the passage to view instant Academic Lexicon definition & pronunciation.
          </span>
        </div>
        <span className="font-mono text-[10px] text-blue-600/80 dark:text-blue-400/80 hidden sm:inline">
          Esc to close tooltip
        </span>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Full Reading Passage Column */}
        <div
          ref={passageRef}
          onDoubleClick={handlePassageDoubleClick}
          className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all ${
            isFocusMode ? 'bg-white dark:bg-slate-900' : 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className={`${isFocusMode ? 'max-w-3xl' : 'max-w-2xl'} mx-auto space-y-6 select-text`}>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Academic Reading Passage 1
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {passage.title}
              </h1>
            </div>

            <div
              className="space-y-5 text-slate-800 dark:text-slate-200 leading-relaxed font-sans cursor-text"
              style={{ fontSize: `${fontSize}px` }}
            >
              {passage.paragraphs.map((p) => (
                <div
                  key={p.id}
                  className={`relative pl-8 transition-colors rounded-xl p-2.5 ${
                    highlightMode ? 'hover:bg-amber-50/70 dark:hover:bg-amber-950/30 cursor-text' : ''
                  }`}
                >
                  <span className="absolute left-1 top-2.5 font-bold text-xs text-blue-600 dark:text-blue-400 font-mono select-none">
                    [{p.id}]
                  </span>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dual-Pane Mode: Right Column Questions */}
        {!isFocusMode && (
          <div className="w-96 md:w-[440px] bg-slate-50 dark:bg-slate-950 p-5 overflow-y-auto space-y-5 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Questions 1–4
              </h3>
              {isSubmitted && (
                <button
                  onClick={handleReset}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset Answers
                </button>
              )}
            </div>

            {renderQuestionsList()}
          </div>
        )}
      </div>

      {/* Focus Mode: Floating Question Summoner Button */}
      {isFocusMode && (
        <button
          onClick={() => setIsQuestionDrawerOpen(true)}
          className="absolute bottom-6 right-8 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center gap-2.5 text-xs font-bold transition-transform active:scale-95 z-30"
          title="Open slide-over question drawer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Questions (Q1–Q4) · {answeredCount}/4</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Focus Mode: Slide-Over Question Drawer */}
      {isFocusMode && isQuestionDrawerOpen && (
        <>
          {/* Backdrop Scrim */}
          <div
            onClick={() => setIsQuestionDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity"
          />

          {/* Slide-in Drawer */}
          <div className="absolute top-0 bottom-0 right-0 w-96 md:w-[460px] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Questions 1–4
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    {answeredCount}/4 Answered
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Press Esc to slide away drawer
                </div>
              </div>

              <button
                onClick={() => setIsQuestionDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderQuestionsList()}
            </div>

            {/* Drawer Action Footer */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              {isSubmitted ? (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:underline"
                >
                  Reset Answers
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">
                  {answeredCount} of 4 answered
                </span>
              )}

              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check Reading Answers</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* QUICK-DEFINE FLOATING DICTIONARY TOOLTIP */}
      {tooltip && (
        <>
          {/* Transparent Backdrop to dismiss on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setTooltip(null)}
          />

          <div
            style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }}
            className="fixed z-50 w-80 md:w-88 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none text-left"
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Academic Lexicon
                </span>
              </div>
              <button
                onClick={() => setTooltip(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dismiss (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tooltip Body */}
            {tooltip.loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Looking up &ldquo;{tooltip.word}&rdquo;...</span>
              </div>
            ) : tooltip.entry ? (
              <div className="pt-2.5 space-y-2.5">
                {/* Word, Phonetics & Audio Pronounce */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {tooltip.entry.word}
                    </h4>
                    {tooltip.entry.phonetic && (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {tooltip.entry.phonetic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePronounce(tooltip.entry!.word, tooltip.entry!.audioUrl)}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      title="Listen to British pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(tooltip.entry!.word)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy word"
                    >
                      {copiedWord ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Grammatical Badges */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {tooltip.entry.partOfSpeech}
                  </span>
                  {tooltip.entry.cefr && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                      CEFR {tooltip.entry.cefr}
                    </span>
                  )}
                </div>

                {/* Bangla Translation & Pronunciation Block */}
                {tooltip.entry.banglaMeaning && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Languages className="w-3 h-3" /> বাংলা অর্থ
                      </span>
                      {tooltip.entry.banglaPronunciation && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          উচ্চারণ: {tooltip.entry.banglaPronunciation}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {tooltip.entry.banglaMeaning}
                    </div>
                    {tooltip.entry.banglaContext && (
                      <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-snug pt-0.5">
                        {tooltip.entry.banglaContext}
                      </p>
                    )}
                  </div>
                )}

                {/* English Definition */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    English Definition
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    {tooltip.entry.definition}
                  </p>
                </div>

                {/* Example sentence */}
                {tooltip.entry.example && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                    &ldquo;{tooltip.entry.example}&rdquo;
                  </div>
                )}

                {/* Synonyms */}
                {tooltip.entry.synonyms && tooltip.entry.synonyms.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Synonyms: </span>
                    {tooltip.entry.synonyms.join(', ')}
                  </div>
                )}

                {/* Tooltip Footer Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Cambridge Standard CDT
                  </span>
                  <button
                    onClick={() => handleToggleSaveVocab(tooltip.entry!)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isWordSaved(tooltip.entry.word)
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isWordSaved(tooltip.entry.word) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                        <span>Save to Vocab (+10 XP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No dictionary definition found for &ldquo;{tooltip.word}&rdquo;.
              </div>
            )}
          </div>
        </>
      )}

      {/* SAVED ACADEMIC VOCABULARY MODAL */}
      {isVocabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    My Academic Vocabulary Notebook
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {savedVocab.length} words saved from reading sessions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVocabModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {savedVocab.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <BookMarked className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold">No saved words yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Double-click any unfamiliar word in the reading passage and tap &ldquo;Save to Vocab&rdquo; to build your personalized IELTS lexicon.
                  </p>
                </div>
              ) : (
                savedVocab.map((item) => (
                  <div
                    key={item.word}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize">
                          {item.word}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {item.partOfSpeech}
                        </span>
                        {item.cefr && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                            {item.cefr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePronounce(item.word, item.audioUrl)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                          title="Pronounce"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleSaveVocab(item)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                          title="Remove from notebook"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.banglaMeaning && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">বাংলা:</span>
                        <span>{item.banglaMeaning}</span>
                        {item.banglaPronunciation && (
                          <span className="text-[11px] text-slate-400 font-normal">({item.banglaPronunciation})</span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 dark:text-slate-300">{item.definition}</p>

                    {item.example && (
                      <p className="text-[11px] text-slate-500 italic border-l-2 border-blue-400 pl-2">
                        &ldquo;{item.example}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Saved words sync automatically across sessions
              </span>
              <button
                onClick={() => setIsVocabModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
