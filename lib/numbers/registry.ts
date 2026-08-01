import { italianNumberLanguage } from './it';
import type { NumberLanguage, NumberLanguageCode } from './types';

/**
 * Registry of number-language implementations. Only Italian ships today; adding another
 * practiced language later (e.g. English or French numbers) means writing a new module
 * shaped like `it.ts` and registering it here — no changes needed in session/UI code.
 */
export const NUMBER_LANGUAGES: Record<NumberLanguageCode, NumberLanguage> = {
  it: italianNumberLanguage,
};

export function getNumberLanguage(code: NumberLanguageCode): NumberLanguage {
  return NUMBER_LANGUAGES[code];
}

export const DEFAULT_NUMBER_LANGUAGE: NumberLanguageCode = 'it';

export type { NumberLanguage, NumberLanguageCode } from './types';
