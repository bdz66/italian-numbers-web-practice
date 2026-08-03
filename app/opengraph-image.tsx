import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site/config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1c6ff5 0%, #152a5c 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 24,
            fontSize: 120,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: -2,
          }}
        >
          <span>uno</span>
          <span style={{ opacity: 0.55 }}>due</span>
          <span style={{ opacity: 0.3 }}>tre</span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            fontSize: 30,
            color: '#d9edff',
          }}
        >
          Learn numbers in Italian by listening and speaking
        </div>
      </div>
    ),
    size,
  );
}
