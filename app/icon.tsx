import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1c6ff5',
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 260,
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          7
        </div>
      </div>
    ),
    size,
  );
}
