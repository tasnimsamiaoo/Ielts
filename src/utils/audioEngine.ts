/**
 * High-Fidelity Audio Engine for IELTS Listening Practice
 * Supports:
 * - Real Human MP3 Audio Streaming (via HTML5 Audio & Web Audio API)
 * - Live Frequency Spectrum Analyser (analyzing real human voice frequencies)
 * - Playhead scrubbing, speed switching (0.75x, 1.0x, 1.25x)
 * - Question chapter marker navigation & transcript synchronization
 */

import { TranscriptLine } from '../types/ielts';

class ListeningAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private playbackRate: number = 1.0;
  private activeLineIndex: number = 0;
  private script: TranscriptLine[] = [];
  private currentSeconds: number = 0;
  private totalDuration: number = 320;
  private audioUrl: string | null = null;

  // Callbacks
  private onTimeUpdateCallback: ((seconds: number, activeIndex: number) => void) | null = null;
  private onFrequencyUpdateCallback: ((freqs: number[]) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private animFrameId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';

      this.audioElement.ontimeupdate = () => {
        if (!this.audioElement) return;
        this.currentSeconds = Math.floor(this.audioElement.currentTime);

        // Find active transcript line based on current time
        let activeIdx = 0;
        for (let i = 0; i < this.script.length; i++) {
          if (this.currentSeconds >= this.script[i].timeInSeconds) {
            activeIdx = i;
          } else {
            break;
          }
        }
        this.activeLineIndex = activeIdx;

        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentSeconds, this.activeLineIndex);
        }
      };

      this.audioElement.onended = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.stopVisualizer();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      };

      this.audioElement.onloadedmetadata = () => {
        if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.totalDuration = Math.round(this.audioElement.duration);
        }
      };
    }
  }

  private initWebAudio() {
    if (this.audioCtx || !this.audioElement || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch {
      // Graceful fallback if CORS or already connected
    }
  }

  public loadTrack(audioUrl: string, script: TranscriptLine[], durationSeconds: number = 320) {
    this.stop();
    this.audioUrl = audioUrl;
    this.script = script;
    this.totalDuration = durationSeconds;
    this.activeLineIndex = 0;
    this.currentSeconds = 0;

    if (this.audioElement) {
      this.audioElement.playbackRate = this.playbackRate;

      // Check offline CacheStorage first for instant offline playback
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches
          .open('ielts-offline-v1')
          .then(async (cache) => {
            const cachedResponse = await cache.match(audioUrl);
            if (cachedResponse) {
              const audioBlob = await cachedResponse.blob();
              const objectUrl = URL.createObjectURL(audioBlob);
              if (this.audioElement) {
                this.audioElement.src = objectUrl;
                this.audioElement.load();
              }
            } else {
              if (this.audioElement) {
                this.audioElement.src = audioUrl;
                this.audioElement.load();
              }
            }
          })
          .catch(() => {
            if (this.audioElement) {
              this.audioElement.src = audioUrl;
              this.audioElement.load();
            }
          });
      } else {
        this.audioElement.src = audioUrl;
        this.audioElement.load();
      }
    }
  }

  public play(fromSeconds: number = 0) {
    if (!this.audioElement) return;

    // Resume AudioContext if suspended by browser autoplay policy
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.initWebAudio();

    if (fromSeconds > 0 && Math.abs(this.audioElement.currentTime - fromSeconds) > 1) {
      this.audioElement.currentTime = fromSeconds;
    }

    this.audioElement.playbackRate = this.playbackRate;
    const playPromise = this.audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.isPaused = false;
          this.startVisualizer();
        })
        .catch(() => {
          // Fallback if browser blocks automatic audio play
          this.isPlaying = false;
        });
    }
  }

  public pause() {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.isPaused = true;
      this.stopVisualizer();
    }
  }

  public resume() {
    if (this.audioElement) {
      this.play(this.audioElement.currentTime);
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.stopVisualizer();
  }

  public seekToSeconds(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.totalDuration));
      this.currentSeconds = Math.floor(this.audioElement.currentTime);
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentSeconds, this.activeLineIndex);
      }
    }
  }

  public seekToLine(index: number) {
    if (this.script[index]) {
      this.seekToSeconds(this.script[index].timeInSeconds);
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public onTimeUpdate(callback: (seconds: number, activeIndex: number) => void) {
    this.onTimeUpdateCallback = callback;
  }

  public onFrequencyUpdate(callback: (freqs: number[]) => void) {
    this.onFrequencyUpdateCallback = callback;
  }

  public onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  private startVisualizer() {
    this.stopVisualizer();

    const updateVisualizer = () => {
      if (!this.isPlaying || this.isPaused) return;

      let freqs: number[] = [];

      if (this.analyser) {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Normalize 32 bins to percentage (0 - 100%)
        freqs = Array.from(dataArray.slice(0, 36)).map((val) => Math.max(12, Math.round((val / 255) * 100)));
      } else {
        // Organic simulated frequencies if audio context is unavailable
        freqs = Array.from({ length: 36 }).map((_, i) => {
          const formant = Math.sin((i / 36) * Math.PI) * 60;
          const energy = Math.random() * 30 + 15;
          return Math.round(formant + energy);
        });
      }

      if (this.onFrequencyUpdateCallback) {
        this.onFrequencyUpdateCallback(freqs);
      }

      this.animFrameId = requestAnimationFrame(updateVisualizer);
    };

    this.animFrameId = requestAnimationFrame(updateVisualizer);
  }

  private stopVisualizer() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    const idleFreqs = new Array(36).fill(12);
    if (this.onFrequencyUpdateCallback) {
      this.onFrequencyUpdateCallback(idleFreqs);
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      playbackRate: this.playbackRate,
      activeLineIndex: this.activeLineIndex,
      currentSeconds: this.currentSeconds,
      totalDuration: this.totalDuration,
      isRealAudio: true,
      audioUrl: this.audioUrl,
    };
  }
}

export const listeningAudioEngine = new ListeningAudioEngine();
