'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCachedVoices, loadVoices, pickVoiceForLang, speak as speakUtterance } from '@/lib/speech/tts';
import { isTTSSupported } from '@/lib/speech/support';

export interface UseSpeechSynthesisResult {
  supported: boolean;
  isSpeaking: boolean;
  hasVoiceForLang: boolean;
  speakText: (text: string) => void;
  cancel: () => void;
}

export function useSpeechSynthesis(lang: string): UseSpeechSynthesisResult {
  const supported = isTTSSupported();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasVoiceForLang, setHasVoiceForLang] = useState(true);
  const cancelRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!supported) return;
    loadVoices().then((voices) => {
      const source = voices.length > 0 ? voices : getCachedVoices();
      setHasVoiceForLang(Boolean(pickVoiceForLang(source, lang)) || source.length === 0);
    });
  }, [supported, lang]);

  const speakText = useCallback(
    (text: string) => {
      if (!supported) return;
      const voices = getCachedVoices();
      const voice = pickVoiceForLang(voices, lang);
      cancelRef.current = speakUtterance(text, {
        lang,
        voice,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [supported, lang],
  );

  const cancel = useCallback(() => {
    cancelRef.current();
    setIsSpeaking(false);
  }, []);

  useEffect(() => () => cancelRef.current(), []);

  return { supported, isSpeaking, hasVoiceForLang, speakText, cancel };
}
