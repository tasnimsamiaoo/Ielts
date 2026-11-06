import React, { useState, useEffect } from 'react';
import {
  Download,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle2,
  Trash2,
  X,
  FileArchive,
  Volume2,
  BookOpen,
  Sparkles,
  Calculator,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  getOfflineCacheStatus,
  precacheAllOfflineAssets,
  clearOfflineCache,
  downloadStandaloneZipPackage,
  OfflineCacheStatus,
} from '../../utils/offlineManager';

interface OfflineCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export const OfflineCenterModal: React.FC<OfflineCenterModalProps> = ({
  isOpen,
  onClose,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const [cacheStatus, setCacheStatus] = useState<OfflineCacheStatus>({
    isCached: false,
    audioFilesCount: 0,
    totalAudioFiles: 4,
    estimatedBytes: 0,
    lastCachedDate: null,
  });

  // Precaching state
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [precacheProgress, setPrecacheProgress] = useState(0);
  const [precacheStep, setPrecacheStep] = useState('');

  // ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStep, setZipStep] = useState('');
  const [isZipSuccess, setIsZipSuccess] = useState(false);

  // Real browser online status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshStatus = async () => {
    const status = await getOfflineCacheStatus();
    setCacheStatus(status);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrecache = async () => {
    try {
      setIsPrecaching(true);
      setPrecacheProgress(0);
      setPrecacheStep('Starting precache...');
      await precacheAllOfflineAssets((percent, step) => {
        setPrecacheProgress(percent);
        setPrecacheStep(step);
      });
      await refreshStatus();
    } catch (err) {
      console.error('Error precaching assets:', err);
    } finally {
      setIsPrecaching(false);
    }
  };

  const handleClearCache = async () => {
    await clearOfflineCache();
    await refreshStatus();
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setIsZipSuccess(false);
      setZipProgress(0);
      setZipStep('Packaging standalone files...');
      await downloadStandaloneZipPackage((percent, step) => {
        setZipProgress(percent);
        setZipStep(step);
      });
      setIsZipSuccess(true);
      setTimeout(() => setIsZipSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating offline zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Offline System & Standalone Download
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Zero Network Required
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice Cambridge Listening, Reading, Writing & Speaking completely offline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Offline Simulation Active
                  </span>
                </>
              ) : isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Browser Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    Browser Offline
                  </span>
                </>
              )}
            </div>

            <span className="text-slate-300 dark:text-slate-700">·</span>

            <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {cacheStatus.isCached ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All 4 Studio Audio MP3s Precached (~21.8 MB)
                </span>
              ) : (
                <span>Storage: 0 MB Precached</span>
              )}
            </div>
          </div>

          <button
            onClick={onToggleSimulatedOffline}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isSimulatedOffline ? 'Disable Offline Test' : 'Test Offline Mode'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Card 1: In-Browser Precaching */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    1. In-Browser Offline Precaching
                  </h4>
                  {cacheStatus.isCached && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      Cached & Ready
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Caches all real studio-recorded audio MP3s, full Cambridge question papers, and the Academic Dictionary directly in your current browser. You can bookmark this page and study in Airplane Mode with zero internet!
                </p>
              </div>
            </div>

            {/* Precaching progress bar */}
            {isPrecaching && (
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 truncate max-w-md">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="truncate">{precacheStep}</span>
                  </span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300 ml-2">
                    {precacheProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${precacheProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {cacheStatus.lastCachedDate ? (
                <span className="text-[11px] text-slate-400 font-mono">
                  Last updated: {cacheStatus.lastCachedDate}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Approx. 21.8 MB (Audio + Lexicon Data)
                </span>
              )}

              <div className="flex items-center gap-2">
                {cacheStatus.isCached && (
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cache</span>
                  </button>
                )}

                <button
                  onClick={handlePrecache}
                  disabled={isPrecaching}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isPrecaching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Precaching Assets...</span>
                    </>
                  ) : cacheStatus.isCached ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Re-Sync Full Cache</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Precache Full System</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Download Standalone ZIP Bundle */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    2. Download Standalone Offline Package (.zip)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    Portable Bundle
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Downloads a self-contained ZIP archive containing <code>index.html</code>, the <code>audio/</code> MP3 folder, and complete Cambridge test data. Unzip anywhere and double-click to run on any computer with zero setup!
                </p>
              </div>
            </div>

            {/* ZIP Progress */}
            {isZipping && (
              <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 truncate max-w-md">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="truncate">{zipStep}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 ml-2">
                    {zipProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-200"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Includes: 4 Studio MP3s · Local HTML App · Test JSON
              </span>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating ZIP...</span>
                  </>
                ) : isZipSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Download Started!</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>Download Offline System (.zip)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Included Features Checklist */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
              Offline Capabilities Included in Full System:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Real Studio MP3 Audio (Sections 1–4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Reading Room Focus Mode & Transcripts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Writing Studio Rubric & Word Counter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Speaking Booth Cue Card Prep Timer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Complete Academic Lexicon Dictionary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Automated Raw-to-Band Score Algorithms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero external API or internet connection required when offline</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
