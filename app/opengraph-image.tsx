import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NextLocal AI — Get Found in AI Search';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#f5f2eb',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Left panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px',
            borderRight: '2px solid #1a1a16',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1a1a16', letterSpacing: '-0.5px' }}>
              Next
            </span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#c8460a', letterSpacing: '-0.5px' }}>
              Local
            </span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#1a1a16', letterSpacing: '-0.5px' }}>
              {' '}AI
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#c8460a', flexShrink: 0 }} />
              <span style={{
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#c8460a',
                fontFamily: 'monospace',
              }}>
                AI Visibility for Local Business
              </span>
            </div>
            <div style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1.0,
              color: '#1a1a16',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span>Get Found</span>
              <span>in AI Search.</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: '18px',
            color: '#6b6b5e',
            fontFamily: 'sans-serif',
            fontWeight: 300,
            lineHeight: 1.5,
          }}>
            When customers ask ChatGPT who to call,<br />
            your name should come up.
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            width: '340px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a16',
            padding: '64px 48px',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          {['ChatGPT', 'Perplexity', 'Google AI', 'Claude'].map((platform) => (
            <div key={platform} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#c8460a',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '20px',
                color: '#ede9de',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}>
                {platform}
              </span>
            </div>
          ))}

          <div style={{
            marginTop: '16px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(237,233,222,0.15)',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#6b6b5e',
            letterSpacing: '0.1em',
          }}>
            nextlocal.ai
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
