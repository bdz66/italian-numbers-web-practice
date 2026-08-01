import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Italian Numbers Practice',
  description: 'Learn Italian numbers by listening and speaking, right in your browser.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
