export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSTTSupported(): boolean {
  return getSpeechRecognitionCtor() !== undefined;
}
