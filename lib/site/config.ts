// Update NEXT_PUBLIC_SITE_URL once the app has a real domain (falls back to a
// placeholder so metadata/JSON-LD/sitemaps still build correctly without it).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/$/, '');

export const SITE_NAME = 'Practice Italian Numbers';

export const SITE_DESCRIPTION =
  'Free browser-based trainer for Italian numbers. Listen to numbers spoken aloud and type ' +
  'what you hear, or say numbers out loud and get instant speech-recognition feedback. ' +
  'Pick any range from 0 to 1,000,000, practice sequentially or at random, and track your ' +
  'accuracy and speed over time — no sign-up, no data collection.';
