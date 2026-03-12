import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();
import { notFound } from 'next/navigation';
import type { ReportData } from '@/app/api/save-report/route';

function gradeColor(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith('A') || g.startsWith('B')) return '#1a1a16';
  return '#c8460a';
}

function gradeDescriptor(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return 'Excellent';
  if (g.startsWith('B')) return 'Good';
  if (g.startsWith('C')) return 'Needs improvement';
  if (g.startsWith('D')) return 'Poor';
  return 'Critical';
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await kv.get<ReportData>(`report:${id}`);
  if (!data) notFound();

  const createdAt = new Date(data.created_at);
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 30);

  const subcategories = [
    { label: 'Google Business', grade: data.gbp_grade },
    { label: 'Reviews', grade: data.reviews_grade },
    { label: 'Citations', grade: data.citations_grade },
    { label: 'Website', grade: data.website_grade },
    { label: 'AI Presence', grade: data.ai_grade },
  ];

  const actions = [data.action_1, data.action_2, data.action_3];

  return (
    <main style={{ backgroundColor: '#f5f2eb', color: '#1a1a16', fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 300 }}>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav style={{
        backgroundColor: '#f5f2eb', borderBottom: '2px solid #1a1a16',
        padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '11px', letterSpacing: '0.14em',
          color: '#6b6b5e', textTransform: 'uppercase',
        }}>nextlocal.ai</span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #1a1a16' }}>
        {/* Left: business info */}
        <div style={{
          padding: '60px 48px', borderRight: '2px solid #1a1a16',
          backgroundColor: '#f5f2eb', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#c8460a', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ display: 'inline-block', width: '32px', height: '2px', backgroundColor: '#c8460a', flexShrink: 0 }} />
            AI Visibility Report
          </p>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: 'clamp(40px, 4vw, 64px)', lineHeight: 1.0,
            color: '#1a1a16', marginBottom: '16px',
          }}>
            {data.business_name}
          </h1>
          <p style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '12px', color: '#6b6b5e',
          }}>
            Prepared by NextLocal AI · {fmtDate(createdAt)}
          </p>
        </div>

        {/* Right: overall grade */}
        <div style={{
          padding: '60px 48px', backgroundColor: '#1a1a16',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: 'clamp(96px, 10vw, 128px)', lineHeight: 1,
            color: '#c8460a',
          }}>
            {data.overall_grade}
          </span>
          <p style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#6b6b5e', marginTop: '8px',
          }}>
            Overall AI Visibility Grade
          </p>
          <p style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '13px', color: '#ede9de',
          }}>
            {gradeDescriptor(data.overall_grade)}
          </p>
        </div>
      </section>

      {/* ── Score Cards ──────────────────────────────────────────── */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        borderBottom: '2px solid #1a1a16',
      }}>
        {subcategories.map(({ label, grade }, i) => (
          <div key={label} style={{
            padding: '32px 24px', textAlign: 'center',
            borderRight: i < 4 ? '1px solid #1a1a16' : 'none',
          }}>
            <p style={{
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#6b6b5e', marginBottom: '16px',
            }}>
              {label}
            </p>
            <span style={{
              fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
              fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 1,
              color: gradeColor(grade),
            }}>
              {grade}
            </span>
          </div>
        ))}
      </section>

      {/* ── Analysis ─────────────────────────────────────────────── */}
      <section style={{
        display: 'grid', gridTemplateColumns: '220px 1fr',
        borderBottom: '2px solid #1a1a16',
      }}>
        <div style={{
          padding: '48px 32px', borderRight: '2px solid #1a1a16',
          backgroundColor: '#ede9de',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: '200px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: '36px', lineHeight: 1.1, color: '#1a1a16',
          }}>
            What the data says.
          </h2>
          <span style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#6b6b5e', writingMode: 'vertical-rl',
            transform: 'rotate(180deg)', alignSelf: 'flex-end',
          }}>
            Analysis
          </span>
        </div>
        <div style={{
          padding: '48px 56px', backgroundColor: '#f5f2eb',
          display: 'flex', alignItems: 'center',
        }}>
          <blockquote style={{ borderLeft: '4px solid #c8460a', paddingLeft: '24px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '18px', lineHeight: 1.75, color: '#1a1a16', fontWeight: 300,
            }}>
              {data.narrative}
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── What to do next ──────────────────────────────────────── */}
      <section style={{
        backgroundColor: '#1a1a16',
        padding: '80px 48px',
        borderBottom: '2px solid #1a1a16',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
          fontSize: 'clamp(36px, 4vw, 52px)', color: '#ede9de', marginBottom: '52px',
        }}>
          What to do next.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {actions.map((action, i) => (
            <div key={i} style={{
              padding: '40px 32px', border: '1px solid rgba(237,233,222,0.15)',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{
                position: 'absolute', top: '16px', right: '16px',
                fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
                fontSize: '120px', lineHeight: 1,
                color: 'rgba(237,233,222,0.04)', userSelect: 'none',
                pointerEvents: 'none',
              }}>
                0{i + 1}
              </span>
              <span style={{
                fontFamily: 'var(--font-ibm-plex-mono), monospace',
                fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#c8460a', display: 'block', marginBottom: '14px',
              }}>
                0{i + 1}
              </span>
              <p style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '15px', lineHeight: 1.65, color: '#ede9de',
                fontWeight: 300, position: 'relative', zIndex: 1,
              }}>
                {action}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderBottom: '2px solid #1a1a16',
      }}>
        <div style={{ padding: '72px 48px', backgroundColor: '#c8460a' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1.1,
            color: 'white', marginBottom: '16px',
          }}>
            Ready to move up?
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '18px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65,
          }}>
            Let&apos;s walk through this report together and build your 90-day visibility plan.
          </p>
        </div>
        <div style={{
          padding: '72px 48px', backgroundColor: '#ede9de',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <a
            href="https://cal.com/nextlocal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', width: '100%',
              padding: '20px 32px', backgroundColor: '#1a1a16',
              color: '#ede9de',
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
              textAlign: 'center', textDecoration: 'none',
            }}
          >
            Book Your Free 15-Min Report Walkthrough →
          </a>
          <p style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '10px', letterSpacing: '0.1em', color: '#6b6b5e',
          }}>
            No obligation. 15 minutes. Real answers.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{
        backgroundColor: '#1a1a16', padding: '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px',
      }}>
        <LogoLight />
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '10px', color: '#6b6b5e',
        }}>
          This report expires on {fmtDate(expiresAt)}
        </span>
        <span style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '10px', color: '#6b6b5e',
        }}>
          © {createdAt.getFullYear()} NextLocal AI. Austin, TX.
        </span>
      </footer>
    </main>
  );
}

function Logo() {
  return (
    <span style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 900, fontSize: '20px', color: '#1a1a16' }}>
      Next<span style={{ color: '#c8460a' }}>Local</span> AI
    </span>
  );
}

function LogoLight() {
  return (
    <span style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 900, fontSize: '20px', color: '#f5f2eb' }}>
      Next<span style={{ color: '#c8460a' }}>Local</span> AI
    </span>
  );
}
