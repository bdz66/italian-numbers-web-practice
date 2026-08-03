import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site/config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Learn Numbers in Italian by Listening & Speaking`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'practice italian numbers',
    'learn italian numbers',
    'italian numbers listening practice',
    'italian numbers speaking practice',
    'italian numbers pronunciation',
    'numeri in italiano',
    'italian number quiz',
    'italian language learning app',
    'italian numbers 1 to 100',
    'italian numbers trainer',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: 'Practice Italian Numbers' }],
  creator: 'Practice Italian Numbers',
  publisher: 'Practice Italian Numbers',
  category: 'education',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Learn Numbers in Italian by Listening & Speaking`,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
    alternateLocale: ['it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Learn Numbers in Italian by Listening & Speaking`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any (runs in a web browser)',
  inLanguage: ['en', 'it'],
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Listening practice: hear Italian numbers spoken aloud and type what you heard',
    'Speaking practice: say Italian numbers aloud with speech-recognition feedback',
    'Custom number ranges from 0 to 1,000,000',
    'Sequential or randomized question order',
    'Session results with accuracy, timing, and per-number breakdown',
    'Local session history with no account required',
  ],
  browserRequirements: 'Requires a browser with Web Speech API support',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <I18nProvider>{children}</I18nProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "efbc41fe1ec041c297e980dc77d84f3c"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
