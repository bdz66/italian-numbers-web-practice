import type { NumberLanguage, SpokenMatchResult } from './types';

const UNITS = [
  'zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove',
  'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
  'diciassette', 'diciotto', 'diciannove',
];

const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];

/** 0-99 */
function twoDigitsToWords(n: number): string {
  if (n < 20) return UNITS[n] ?? '';
  const tens = Math.floor(n / 10);
  const units = n % 10;
  let tensWord = TENS[tens] ?? '';
  if (units === 0) return tensWord;
  // "venti"/"trenta"/... lose their final vowel before "uno" and "otto".
  if (units === 1 || units === 8) {
    tensWord = tensWord.slice(0, -1);
  }
  return tensWord + UNITS[units];
}

/** 0-999 */
function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let word = '';
  if (hundreds === 1) word = 'cento';
  else if (hundreds > 1) word = UNITS[hundreds] + 'cento';
  if (rest > 0) word += twoDigitsToWords(rest);
  return word;
}

/** "tre" carries a grave accent when it's the final syllable of a larger number (ventitré, trentatré...). */
function applyTreAccent(word: string, n: number): string {
  if (n !== 3 && n % 10 === 3 && word.endsWith('tre')) {
    return `${word.slice(0, -3)}tré`;
  }
  return word;
}

/**
 * Converts a non-negative integer into Italian words, e.g. 42 -> "quarantadue".
 * Handles the full magnitude range up to hundreds of millions; the app's UI keeps
 * practice ranges far below that, but the algorithm itself doesn't special-case a cap.
 */
export function numberToItalianWords(input: number): string {
  const n = Math.trunc(input);
  if (n === 0) return 'zero';
  if (n < 0) return `meno ${numberToItalianWords(-n)}`;

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? 'un miliardo' : `${threeDigitsToWords(billions)} miliardi`);
  }
  if (millions > 0) {
    parts.push(millions === 1 ? 'un milione' : `${threeDigitsToWords(millions)} milioni`);
  }

  let tail = '';
  if (thousands > 0) {
    tail += thousands === 1 ? 'mille' : `${threeDigitsToWords(thousands)}mila`;
  }
  if (rest > 0 || (thousands === 0 && millions === 0 && billions === 0)) {
    tail += threeDigitsToWords(rest);
  }
  if (tail) parts.push(tail);

  return applyTreAccent(parts.join(' '), n);
}

/** Lowercase, strip accents/diacritics, strip everything but letters and digits (spaces included). */
export function normalizeItalianText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (curr[j - 1] ?? Infinity) + 1,
        (prev[j] ?? Infinity) + 1,
        (prev[j - 1] ?? Infinity) + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n] ?? Math.max(m, n);
}

/**
 * Matches speech-recognition transcripts against the number the user was asked to say.
 * Rather than parsing arbitrary Italian speech back into a number, this compares each
 * candidate transcript against the *known expected answer* three ways, from strictest
 * to most lenient: a literal digit run, an exact normalized word match, then a fuzzy
 * (Levenshtein) match to tolerate minor speech-recognition mistakes.
 */
export function compareSpokenToNumber(transcripts: string[], correct: number): SpokenMatchResult {
  const expectedWords = normalizeItalianText(numberToItalianWords(correct));
  const expectedDigits = String(correct);

  for (const t of transcripts) {
    const digitRuns = t.match(/\d+/g);
    if (digitRuns?.some((d) => d === expectedDigits || Number(d) === correct)) {
      return { isMatch: true, method: 'digits', matchedTranscript: t };
    }
  }

  for (const t of transcripts) {
    if (normalizeItalianText(t) === expectedWords) {
      return { isMatch: true, method: 'exact-words', matchedTranscript: t };
    }
  }

  const threshold = Math.min(3, Math.max(1, Math.ceil(expectedWords.length * 0.18)));
  for (const t of transcripts) {
    const normalized = normalizeItalianText(t);
    if (!normalized) continue;
    if (levenshteinDistance(normalized, expectedWords) <= threshold) {
      return { isMatch: true, method: 'fuzzy-words', matchedTranscript: t };
    }
  }

  return { isMatch: false, method: 'none' };
}

export const italianNumberLanguage: NumberLanguage = {
  code: 'it',
  speechLang: 'it-IT',
  label: 'Italiano',
  toWords: numberToItalianWords,
  normalize: normalizeItalianText,
  compareSpokenToNumber,
};
