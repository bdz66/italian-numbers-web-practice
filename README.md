# Italian Numbers Practice

A single-page web app for practicing Italian numbers by ear and by voice, using the
browser's built-in speech synthesis and speech recognition — no server, no accounts,
no data collection. Everything lives in `localStorage` on your device.

## Features

- **Listening mode** — the app speaks a number in Italian (`speechSynthesis`); you type
  the digits you heard.
- **Speaking mode** — the app shows a digit; you say it aloud in Italian and the
  browser's speech recognition (`SpeechRecognition`) checks what you said.
- **Practice modes** — sequential (lowest → highest) or random order, over any number
  range you choose (with quick presets).
- **Session limits** — cap a session by a time limit (mm:ss) or by a question count,
  and stop early at any time with the Stop button.
- **Detailed results** — correct/incorrect counts, accuracy, total and average time,
  fastest/slowest answers, which numbers were easiest/most difficult, and a full
  per-number breakdown.
- **Local history** — your last 20 sessions are listed on the setup screen so you can
  track progress over time, entirely on-device.
- **Interface language** — the UI itself ships in English and Italian (toggle in the
  top-right of the setup screen); more can be added easily (see [Architecture](#architecture)).

## Privacy

Nothing is sent to a server. There's no backend, no analytics, no cookies, and no
network calls beyond loading the app's own static assets. Session settings and history
are stored only in your browser's `localStorage`, and never leave the device — clear
them any time with the "Clear history" button, or by clearing your browser's site data.

## Getting started

### Locally with npm

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production build locally:

```bash
npm run build
npm run start
```

### With Docker

Production (builds the optimized standalone server, matches what you'd deploy):

```bash
docker compose up --build
```

Development (hot-reloading `next dev`, source mounted from your working tree — mirrors
`npm run dev` but inside a container):

```bash
docker compose --profile dev up dev
```

Both serve the app at [http://localhost:3000](http://localhost:3000).

## Browser support

This is built primarily for **Safari** but works in any browser that implements the
Web Speech API:

- **Speech synthesis** (listening mode) is broadly supported (Safari, Chrome, Edge,
  Firefox). Voice quality/availability of an Italian voice varies by OS — the app warns
  you in-session if it can't find one and falls back to the browser's default voice.
- **Speech recognition** (speaking mode) support is much less consistent. Chrome has
  the most reliable implementation. Safari's support has historically been partial and
  version-dependent, and Firefox largely doesn't implement it. If your browser doesn't
  support it, the app detects this up front and prompts you to try Chrome or switch to
  Listening mode instead.

## How speech matching works

Rather than writing a general Italian speech-to-text-to-number parser, the app compares
each recognized transcript against the **known expected answer** for the current
question (see `lib/numbers/it.ts`), trying three strategies from strictest to most
lenient:

1. **Digit extraction** — if the transcript already contains digits (browsers sometimes
   transcribe spoken numbers directly as digits), compare numerically.
2. **Exact word match** — normalize (lowercase, strip accents/punctuation/spaces) both
   the transcript and the expected number's Italian words (e.g. 42 → `quarantadue`) and
   compare.
3. **Fuzzy match** — fall back to a Levenshtein-distance comparison to tolerate small
   recognition mistakes.

All speech-recognition alternatives (not just the top guess) are checked. This is more
robust than parsing arbitrary Italian speech back into a number, and it sidesteps a lot
of ambiguity in casual spoken number phrasing.

The Italian number-to-words conversion (`numberToItalianWords`) implements the standard
rules: elision before `uno`/`otto` (`ventuno`, `ventotto`), the accented `tré` in
compounds (`ventitré`, `trentatré`), and `cento`/`mille`/`milione`/`miliardo`
composition — general enough to work well beyond the ranges exposed in the UI.

## Architecture

```
app/                    Next.js App Router shell (layout, page, global styles)
components/
  setup/                Practice configuration screen
  practice/             Running-session UI (question components, progress, stop)
  results/              Post-session results/statistics screen
  ui/                    Small shared UI primitives (Button, Card, Segmented, ...)
lib/
  numbers/              Number <-> Italian words conversion, spoken-answer matching,
                         and a small registry so another practiced language can be
                         added later without touching session/UI code
  speech/               speechSynthesis / SpeechRecognition browser API wrappers
  session/              Session config, question generator, state machine, statistics
  storage/               localStorage helpers (settings, history)
  i18n/                  UI translation dictionary (en/it) + provider
hooks/                  useSpeechSynthesis, useSpeechRecognition, useTimer, useLocalStorage
```

State management is plain React (`useReducer` + Context) — no external state library.
i18n is a small hand-rolled dictionary rather than a framework, since the app only ships
two interface languages today.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Browser-native Web Speech API (`speechSynthesis`, `SpeechRecognition`) — no external
  speech/AI services
- No backend, no database

### A note on `npm audit`

`npm audit` reports a few high-severity advisories inherited from Next.js's optional
`sharp`/`postcss` dependency chain used by its built-in image-optimization API route.
This app doesn't use `next/image` or the image optimization route, so that surface isn't
exercised; fixing it would require downgrading Next.js to an old major version, which
isn't a reasonable trade-off. Re-check this if the app later adopts `next/image`.

## Roadmap

Deliberately out of scope for this version, but designed for:

- **Authentication/authorization** — the app is fully anonymous/local today. Adding
  accounts later would mean introducing a backend and syncing the local session
  history, without needing to restructure the practice/session logic itself.
- **More modes** — e.g. a speedrun mode, or counting backwards. The session/question
  generator (`lib/session/generateQuestions.ts`) is written to be extended with new
  ordering/generation strategies without touching the practice UI.
- **More practiced languages** — the number-to-words/matching logic is behind a
  registry (`lib/numbers/registry.ts`); adding e.g. English or French numbers means
  writing one new module shaped like `lib/numbers/it.ts`.
