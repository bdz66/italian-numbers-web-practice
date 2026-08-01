import { isTTSSupported } from './support';

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** Resolves once the browser has reported its available voices (Chrome loads these async). */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isTTSSupported()) return Promise.resolve([]);
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    // Some browsers never fire voiceschanged if voices load synchronously later; poll as a fallback.
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        resolve(voices);
      } else {
        resolve([]);
      }
    }, 1000);
  });

  return voicesPromise;
}

export function pickVoiceForLang(voices: SpeechSynthesisVoice[], langPrefix: string): SpeechSynthesisVoice | undefined {
  const prefix = langPrefix.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === prefix) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix.split('-')[0] ?? prefix))
  );
}

export interface SpeakOptions {
  lang: string;
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

/** Cancels any in-flight utterance and speaks `text`. Returns a function to cancel this utterance. */
export function speak(text: string, options: SpeakOptions): () => void {
  if (!isTTSSupported()) {
    options.onError?.({ error: 'synthesis-unavailable' } as SpeechSynthesisErrorEvent);
    return () => undefined;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang;
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1;
  if (options.voice) utterance.voice = options.voice;

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => options.onError?.(event);

  window.speechSynthesis.speak(utterance);

  return () => window.speechSynthesis.cancel();
}

export function cancelSpeech(): void {
  if (isTTSSupported()) window.speechSynthesis.cancel();
}

export function getCachedVoices(): SpeechSynthesisVoice[] {
  return cachedVoices;
}
