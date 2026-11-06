import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  UploadCloud,
  Download,
  Search,
  Headphones,
  FileText,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  Play,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  FileJson,
  LayoutGrid,
  ListFilter,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  CAMBRIDGE_BOOKS_CATALOG,
  CambridgeBook,
  CambridgeTestSummary,
  getStoredCustomTests,
  saveCustomTest,
  deleteCustomTest,
  generateSampleTestJsonTemplate,
} from '../../data/cambridgeBooksCatalog';
import { FullMockExamDataset } from '../../data/fullMockExamData';
import { AppView } from '../../store/ieltsStore';

interface CambridgeLibraryViewProps {
  onNavigateToView: (view: AppView) => void;
  onSelectTest?: (testId: string) => void;
}

type CategoryFilter = 'all' | 'latest' | 'classic' | 'imported';
type DifficultyFilter = 'all' | 'Foundation' | 'Moderate' | 'Advanced' | 'Mastery';
type ViewDisplayMode = 'grid' | 'by_book';

export const CambridgeLibraryView: React.FC<CambridgeLibraryViewProps> = ({
  onNavigateToView,
  onSelectTest,
}) => {
  // Filtering & Display States
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [selectedBookNumber, setSelectedBookNumber] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDisplayMode, setViewDisplayMode] = useState<ViewDisplayMode>('grid');

  // Expanded Books Set - all expanded by default so all 76 tests are immediately accessible
  const [expandedBookIds, setExpandedBookIds] = useState<Set<string>>(() => {
    return new Set(CAMBRIDGE_BOOKS_CATALOG.map((b) => b.id));
  });

  // Custom Imported Tests State
  const [customTests, setCustomTests] = useState<FullMockExamDataset[]>(() => getStoredCustomTests());

  // JSON Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importValidationResult, setImportValidationResult] = useState<{
    valid: boolean;
    error?: string;
    parsedData?: FullMockExamDataset;
  } | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Selected Test Drawer / Quick Preview
  const [previewTest, setPreviewTest] = useState<CambridgeTestSummary | null>(null);

  // Toggle book expansion in by_book mode
  const toggleBookExpanded = (bookId: string) => {
    setExpandedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedBookIds(new Set(CAMBRIDGE_BOOKS_CATALOG.map((b) => b.id)));
  };

  const handleCollapseAll = () => {
    setExpandedBookIds(new Set());
  };

  // Refresh custom tests
  const refreshCustomTests = () => {
    setCustomTests(getStoredCustomTests());
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      validateJsonInput(text);
    };
    reader.readAsText(file);
  };

  // Validate JSON string against mock exam schema
  const validateJsonInput = (text: string) => {
    if (!text.trim()) {
      setImportValidationResult(null);
      return;
    }

    try {
      const parsed = JSON.parse(text) as FullMockExamDataset;
      if (!parsed.examId || !parsed.title) {
        setImportValidationResult({
          valid: false,
          error: 'JSON is missing required top-level "examId" or "title" property.',
        });
        return;
      }
      if (!parsed.listening && !parsed.reading && !parsed.writing) {
        setImportValidationResult({
          valid: false,
          error: 'JSON must include at least one module (listening, reading, or writing).',
        });
        return;
      }

      setImportValidationResult({
        valid: true,
        parsedData: parsed,
      });
    } catch (err: any) {
      setImportValidationResult({
        valid: false,
        error: `Invalid JSON syntax: ${err.message || 'Check commas and quotes'}`,
      });
    }
  };

  // Commit imported test
  const handleSaveImportedTest = () => {
    if (!importValidationResult?.valid || !importValidationResult.parsedData) return;

    saveCustomTest(importValidationResult.parsedData);
    refreshCustomTests();
    setImportSuccessMessage(`Successfully imported "${importValidationResult.parsedData.title}"!`);
    setTimeout(() => {
      setImportSuccessMessage(null);
      setIsImportModalOpen(false);
      setImportJsonText('');
      setImportFileName('');
      setImportValidationResult(null);
      setSelectedCategory('imported');
    }, 1500);
  };

  // Handle deleting custom test
  const handleDeleteCustomTest = (examId: string, title: string) => {
    if (window.confirm(`Delete imported test "${title}"?`)) {
      deleteCustomTest(examId);
      refreshCustomTests();
    }
  };

  // Download Sample Template
  const handleDownloadSampleTemplate = () => {
    const templateStr = generateSampleTestJsonTemplate();
    const blob = new Blob([templateStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cambridge-ielts-sample-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered Books List
  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'imported') {
      return [];
    }

    return CAMBRIDGE_BOOKS_CATALOG.filter((book) => {
      // Specific Book Number Filter
      if (selectedBookNumber !== 'all' && book.bookNumber !== selectedBookNumber) {
        return false;
      }

      // Category filter
      if (selectedCategory === 'latest' && book.bookNumber < 15) return false;
      if (selectedCategory === 'classic' && book.bookNumber >= 15) return false;

      // Search query across book title, description, or test details
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesBook =
          book.title.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query) ||
          `cambridge ${book.bookNumber}`.includes(query);

        const matchesTest = book.tests.some(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.listeningTheme.toLowerCase().includes(query) ||
            t.readingPassages.some((p) => p.toLowerCase().includes(query)) ||
            t.writingTask1.toLowerCase().includes(query) ||
            t.writingTask2.toLowerCase().includes(query)
        );

        if (!matchesBook && !matchesTest) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        const hasMatchingDiff = book.tests.some((t) => t.difficulty === selectedDifficulty);
        if (!hasMatchingDiff) return false;
      }

      return true;
    });
  }, [selectedCategory, selectedBookNumber, searchQuery, selectedDifficulty]);

  // Flattened Tests for Unified Grid View (All 76 Tests)
  const flattenedAllTests = useMemo(() => {
    const list: { test: CambridgeTestSummary; book: CambridgeBook }[] = [];
    filteredBooks.forEach((book) => {
      book.tests.forEach((test) => {
        if (selectedDifficulty === 'all' || test.difficulty === selectedDifficulty) {
          list.push({ test, book });
        }
      });
    });
    return list;
  }, [filteredBooks, selectedDifficulty]);

  // Launch test actions
  const handleLaunchMock = (testId: string) => {
    if (onSelectTest) onSelectTest(testId);
    onNavigateToView('mock');
  };

  const handleLaunchListening = (testId: string) => {
    if (onSelectTest) onSelectTest(testId);
    onNavigateToView('listening');
  };

  const handleLaunchReading = (testId: string) => {
    if (onSelectTest) onSelectTest(testId);
    onNavigateToView('reading');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
      {/* Hero Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 py-5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Official Examination Series
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                All 19 Volumes · 76 Full Tests · 304 Examination Sections · 100% Offline
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Cambridge IELTS Official Library (Books 1–19)
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Complete archive of all 19 official Cambridge IELTS Academic editions (1996–2024). Every paper is fully loaded with synchronized Computer-Delivered IELTS timers, listening audio, reading passages with instant Bangla vocabulary lookup, and writing evaluators.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadSampleTemplate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs"
              title="Download standard JSON schema template for past papers"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample Template</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Test (JSON)</span>
            </button>
          </div>
        </div>

        {/* Quick Book Selector Strip (Books 19 down to 1) */}
        <div className="max-w-7xl mx-auto mt-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
            <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1 uppercase tracking-wider font-bold">
              Editions:
            </span>
            <button
              onClick={() => {
                setSelectedBookNumber('all');
                setSelectedCategory('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 transition-all ${
                selectedBookNumber === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All 19 Books (76 Papers)
            </button>
            {Array.from({ length: 19 }, (_, i) => 19 - i).map((bNum) => (
              <button
                key={bNum}
                onClick={() => {
                  setSelectedBookNumber(bNum);
                  if (bNum >= 15) setSelectedCategory('latest');
                  else setSelectedCategory('classic');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold shrink-0 transition-all ${
                  selectedBookNumber === bNum
                    ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Book {bNum}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & View Mode Controls Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs & View Mode */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBookNumber('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'all' && selectedBookNumber === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All (1–19)
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('latest');
                  setSelectedBookNumber('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'latest'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Latest (15–19)
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('classic');
                  setSelectedBookNumber('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'classic'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Classic (1–14)
              </button>
              <button
                onClick={() => setSelectedCategory('imported')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'imported'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Imported</span>
                {customTests.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 font-mono text-blue-700 dark:text-blue-300">
                    {customTests.length}
                  </span>
                )}
              </button>
            </div>

            {/* View Mode Toggle: Grid (Open) vs By Book Accordion */}
            {selectedCategory !== 'imported' && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setViewDisplayMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewDisplayMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="View all 76 test papers in an open grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All Papers Grid ({flattenedAllTests.length})</span>
                </button>
                <button
                  onClick={() => setViewDisplayMode('by_book')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewDisplayMode === 'by_book'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Group tests by Cambridge book editions"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>By Book ({filteredBooks.length})</span>
                </button>
              </div>
            )}

            {/* Expand / Collapse All (in by_book mode) */}
            {viewDisplayMode === 'by_book' && selectedCategory !== 'imported' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExpandAll}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                  title="Expand all books"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand All</span>
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                  title="Collapse all books"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Collapse All</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Input & Difficulty Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, passages, tasks..."
                className="w-full pl-9 pr-7 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Foundation">Foundation</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
              <option value="Mastery">Mastery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Custom Imported Section (if selected) */}
        {selectedCategory === 'imported' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-indigo-500" />
                  Your Imported Cambridge Test Papers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tests stored locally in your browser with full offline availability.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import Another Test</span>
              </button>
            </div>

            {customTests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                <FileJson className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Custom Test Papers Imported Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                  Add past papers or institutional mock exams in standard JSON format to practice them directly within our Computer-Delivered IELTS simulation.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleDownloadSampleTemplate}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Download JSON Template
                  </button>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Open Importer
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTests.map((test) => (
                  <div
                    key={test.examId}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {test.examCode || 'CUSTOM-TEST'}
                        </span>
                        <button
                          onClick={() => handleDeleteCustomTest(test.examId, test.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete test"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {test.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {test.reading?.parts?.[0]?.passageTitle
                          ? `Passage 1: ${test.reading.parts[0].passageTitle}`
                          : 'Full test dataset ready for simulated CDT exam.'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span>{test.listening?.parts?.length || 4} Listening Parts</span>
                        <span>·</span>
                        <span>{test.reading?.parts?.length || 3} Passages</span>
                        <span>·</span>
                        <span>Writing Task 1 & 2</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleLaunchMock(test.examId)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Launch Mock</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 1: UNIFIED ALL PAPERS GRID (ALL 76 TESTS OPEN AND VISIBLE) */}
        {selectedCategory !== 'imported' && viewDisplayMode === 'grid' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  Showing {flattenedAllTests.length} Authentic Examination Papers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every test from Cambridge 19 down to Cambridge 1 is pre-loaded and ready for Computer-Delivered CDT mock or section training.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                76 Total Official Papers
              </span>
            </div>

            {flattenedAllTests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Papers Found for this Filter
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBookNumber('all');
                    setSelectedDifficulty('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flattenedAllTests.map(({ test, book }) => {
                  const diffColor =
                    test.difficulty === 'Foundation'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : test.difficulty === 'Moderate'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : test.difficulty === 'Advanced'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                  return (
                    <div
                      key={test.id}
                      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md"
                    >
                      <div>
                        {/* Top Book Badge and Difficulty */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-blue-600 text-white shadow-xs">
                              Book {book.bookNumber}
                            </span>
                            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                              Test {test.testNumber}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${diffColor}`}
                            >
                              {test.difficulty}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {book.year}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">
                          {test.title}
                        </h4>

                        {/* Section Syllabus Details */}
                        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex items-start gap-1.5">
                            <Headphones className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                Listening:
                              </strong>{' '}
                              {test.listeningTheme}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                Reading:
                              </strong>{' '}
                              {test.readingPassages.join(' · ')}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                Writing:
                              </strong>{' '}
                              {test.writingTask1}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                        <button
                          onClick={() => handleLaunchMock(test.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                          title={`Launch Full Mock CDT Exam for ${test.title}`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Full Mock</span>
                        </button>
                        <button
                          onClick={() => handleLaunchReading(test.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Study Reading passages with Bangla vocabulary support"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Reading</span>
                        </button>
                        <button
                          onClick={() => handleLaunchListening(test.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Practice human audio tracks in Listening Lab"
                        >
                          <Headphones className="w-3.5 h-3.5 text-blue-500" />
                          <span>Listening</span>
                        </button>
                        <button
                          onClick={() => setPreviewTest(test)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View full test overview syllabus"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 2: GROUPED BY BOOK EDITION (BOOKS 19 DOWN TO 1) */}
        {selectedCategory !== 'imported' && viewDisplayMode === 'by_book' && (
          <div className="space-y-5">
            {filteredBooks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Cambridge Papers Match Your Search
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBookNumber('all');
                    setSelectedDifficulty('all');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isExpanded = expandedBookIds.has(book.id);

                return (
                  <div
                    key={book.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Book Header Accordion */}
                    <div
                      onClick={() => toggleBookExpanded(book.id)}
                      className="cursor-pointer p-4 md:p-5 flex items-center justify-between gap-4 bg-linear-to-r from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Book Number Pill / Accent */}
                        <div
                          className={`w-12 h-14 rounded-xl bg-gradient-to-br ${book.coverAccent} text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0`}
                        >
                          <span className="text-[10px] font-mono tracking-tighter opacity-80 uppercase">
                            IELTS
                          </span>
                          <span className="text-xl leading-none font-black font-mono">
                            {book.bookNumber}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                              {book.title}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {book.year}
                            </span>
                            {book.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                {book.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            4 Full Papers
                          </span>
                        </div>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          aria-label="Toggle book tests"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Book Tests Expansion Grid */}
                    {isExpanded && (
                      <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {book.tests.map((test) => {
                            const diffColor =
                              test.difficulty === 'Foundation'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : test.difficulty === 'Moderate'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : test.difficulty === 'Advanced'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                            return (
                              <div
                                key={test.id}
                                className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold font-mono text-xs text-blue-600 dark:text-blue-400">
                                        Test {test.testNumber}
                                      </span>
                                      <span className="text-xs text-slate-300 dark:text-slate-700">|</span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${diffColor}`}
                                      >
                                        {test.difficulty}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-400">
                                      {test.totalQuestions} Questions
                                    </span>
                                  </div>

                                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-2 leading-snug">
                                    {test.title}
                                  </h4>

                                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-1.5">
                                      <Headphones className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">
                                        <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                          Listening:
                                        </strong>{' '}
                                        {test.listeningTheme}
                                      </span>
                                    </div>

                                    <div className="flex items-start gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">
                                        <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                          Reading:
                                        </strong>{' '}
                                        {test.readingPassages.join(' · ')}
                                      </span>
                                    </div>

                                    <div className="flex items-start gap-1.5">
                                      <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">
                                        <strong className="text-slate-700 dark:text-slate-200 font-medium">
                                          Writing:
                                        </strong>{' '}
                                        {test.writingTask1}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                  <button
                                    onClick={() => handleLaunchMock(test.id)}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Full Mock</span>
                                  </button>
                                  <button
                                    onClick={() => handleLaunchReading(test.id)}
                                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                                    title="Study Reading passages with Bangla vocabulary support"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Reading</span>
                                  </button>
                                  <button
                                    onClick={() => handleLaunchListening(test.id)}
                                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                                    title="Practice human audio tracks in Listening Lab"
                                  >
                                    <Headphones className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Listening</span>
                                  </button>
                                  <button
                                    onClick={() => setPreviewTest(test)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    title="View full test overview syllabus"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* JSON Test Paper Importer Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Import Cambridge Test Paper (JSON)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload an authentic past paper JSON file or paste custom test questions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {importSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center transition-colors">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  id="json-file-input"
                  className="hidden"
                />
                <label
                  htmlFor="json-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <FileJson className="w-8 h-8 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {importFileName ? importFileName : 'Click to browse JSON file or drag here'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports complete Cambridge CDT full mock structures (Listening, Reading, Writing)
                  </span>
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Or Paste Raw Test JSON Content:
                  </label>
                  <button
                    onClick={handleDownloadSampleTemplate}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download Sample Template
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    validateJsonInput(e.target.value);
                  }}
                  placeholder='{\n  "examId": "cambridge-20-test-1",\n  "title": "Cambridge 20 Test 1",\n  "listening": { ... },\n  "reading": { ... }\n}'
                  className="w-full p-3 font-mono text-xs rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {importValidationResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    importValidationResult.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {importValidationResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {importValidationResult.valid
                        ? 'Valid Test Dataset Schema'
                        : 'Invalid Test Schema'}
                    </p>
                    {importValidationResult.error && (
                      <p className="font-mono text-[11px]">{importValidationResult.error}</p>
                    )}
                    {importValidationResult.parsedData && (
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                        Title: {importValidationResult.parsedData.title} · ID:{' '}
                        {importValidationResult.parsedData.examId}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImportedTest}
                disabled={!importValidationResult?.valid}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to Cambridge Library</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Quick Preview Drawer */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Cambridge {previewTest.bookNumber} · Test {previewTest.testNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  {previewTest.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-blue-500" />
                  Listening Sections (40 Questions)
                </h4>
                <p className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                  {previewTest.listeningTheme}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Academic Reading Passages (3 Passages · 40 Questions)
                </h4>
                <ul className="space-y-1.5">
                  {previewTest.readingPassages.map((p, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span className="font-mono text-emerald-600 font-bold">0{idx + 1}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Academic Writing Tasks (60 Minutes)
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Task 1: </span>
                    {previewTest.writingTask1}
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Task 2: </span>
                    {previewTest.writingTask2}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Difficulty: {previewTest.difficulty}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPreviewTest(null);
                    handleLaunchMock(previewTest.id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Full Mock Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
