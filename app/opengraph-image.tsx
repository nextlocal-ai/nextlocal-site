import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NextLocal AI — AI Visibility for Local Businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const playfairData = await fetch(
    'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xRbPQ.woff2'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#f5f2eb',
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
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <span style={{ fontSize: '26px', fontWeight: 900, color: '#1a1a16', fontFamily: 'Playfair Display' }}>Next</span>
            <span style={{ fontSize: '26px', fontWeight: 900, color: '#c8460a', fontFamily: 'Playfair Display' }}>Local</span>
            <span style={{ fontSize: '26px', fontWeight: 900, color: '#1a1a16', fontFamily: 'Playfair Display' }}> AI</span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '2px', backgroundColor: '#c8460a' }} />
              <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#c8460a' }}>
                AI VISIBILITY FOR LOCAL BUSINESS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, color: '#1a1a16', fontFamily: 'Playfair Display' }}>
                Get Found
              </span>
              <span style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, color: '#1a1a16', fontFamily: 'Playfair Display' }}>
                in AI Search.
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '20px', color: '#6b6b5e', lineHeight: 1.5 }}>
              When customers ask ChatGPT who to call,
            </span>
            <span style={{ fontSize: '20px', color: '#6b6b5e', lineHeight: 1.5 }}>
              your name should come up.
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a16',
            padding: '64px 48px',
            justifyContent: 'center',
            gap: '28px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#c8460a' }} />
            <span style={{ fontSize: '20px', color: '#ede9de' }}>ChatGPT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#c8460a' }} />
            <span style={{ fontSize: '20px', color: '#ede9de' }}>Perplexity</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#c8460a' }} />
            <span style={{ fontSize: '20px', color: '#ede9de' }}>Google AI</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#c8460a' }} />
            <span style={{ fontSize: '20px', color: '#ede9de' }}>Claude</span>
          </div>
          <div
            style={{
              marginTop: '16px',
              paddingTop: '28px',
              borderTop: '1px solid rgba(237,233,222,0.15)',
              display: 'flex',
            }}
          >
            <span style={{ fontSize: '13px', color: '#6b6b5e', letterSpacing: '2px' }}>
              NEXTLOCAL.AI
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairData,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}
