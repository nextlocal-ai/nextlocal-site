'use client';
import { useState } from 'react';
import { generateBrief } from './actions';

function renderMarkdown(text: string): string {
  const cutoffs = ['When selecting', 'Before making', 'It is advisable', 'Consider obtaining', 'To find the best', 'Other mentions'];
  let trimmed = text;
  for (const cutoff of cutoffs) {
    const idx = trimmed.lastIndexOf('\n' + cutoff);
    if (idx > trimmed.length / 2) { trimmed = trimmed.slice(0, idx); break; }
  }

  return trimmed
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;text-decoration:underline">$1</a>')
    .replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:12px;margin-bottom:4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#ede9de">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:12px;margin-bottom:4px;font-size:13px;color:#ede9de">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em style="color:#6b6b5e">$1</em>')
    .replace(/\[(\d+)\]/g, '<sup style="color:#6b6b5e;font-size:9px">[$1]</sup>')
    .replace(/^- /gm, '• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ── Types ───────────────────────────────────────────────────────

interface GradeBlock {
  grade: string;
  specifics: string[];
}

interface AIQueryResult {
  query: string;
  response: string;
  mentioned: boolean;
  error?: string;
}

interface AIVisibility {
  chatgpt: AIQueryResult;
  perplexity: AIQueryResult;
}

interface Brief {
  business_name: string;
  business_type: string;
  location: string;
  overall_grade: string;
  grades: {
    overall: GradeBlock;
    gbp: GradeBlock;
    reviews: GradeBlock;
    citations: GradeBlock;
    website: GradeBlock;
    discoverability: GradeBlock;
  };
  whats_working: string[];
  gaps_to_fix: string[];
  suggested_opening: string;
  weaknesses_to_lead: string[];
  strengths_to_acknowledge: string[];
  key_talking_points: string;
  red_flags: string[];
  contact: { phone: string; website: string; address: string };
}

type PageState = 'idle' | 'loading' | 'done' | 'error';

// ── Helpers ─────────────────────────────────────────────────────

function gradeColor(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return '#22c55e';
  if (g.startsWith('B')) return '#84cc16';
  if (g.startsWith('C')) return '#eab308';
  if (g.startsWith('D')) return '#f97316';
  return '#c8460a';
}

// ── Grade Card ──────────────────────────────────────────────────

function GradeCard({ label, block }: { label: string; block: GradeBlock }) {
  const [open, setOpen] = useState(false);
  const color = gradeColor(block.grade);

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        border: `2px solid ${open ? color : 'rgba(237,233,222,0.15)'}`,
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6b5e' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '28px', color, lineHeight: 1 }}>
          {block.grade}
        </span>
      </div>
      {open && block.specifics?.length > 0 && (
        <ul style={{ marginTop: '12px', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {block.specifics.map((s, i) => (
            <li key={i} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ede9de', lineHeight: 1.5, paddingLeft: '12px', borderLeft: `2px solid ${color}` }}>
              {s}
            </li>
          ))}
        </ul>
      )}
      {!open && (
        <p style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '10px', color: '#6b6b5e', letterSpacing: '0.08em' }}>
          Click to expand ↓
        </p>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function InternalPage() {
  const [businessName, setBusinessName] = useState('');
  const [cityState, setCityState] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [aiVisibility, setAiVisibility] = useState<AIVisibility | null>(null);
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPageState('loading');
    setError('');
    setBrief(null);

    try {
      const result = await generateBrief(businessName, cityState);
      if (result.error) throw new Error(result.error);
      const data = result.data;
      setBrief(data.brief);
      setAiVisibility(data.ai_visibility || null);
      setReportId(data.report_id || '');
      setPageState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPageState('error');
    }
  }

  function reset() {
    setBrief(null);
    setAiVisibility(null);
    setReportId('');
    setPageState('idle');
    setError('');
    setCopied(false);
  }

  function copyBrief() {
    if (!brief) return;
    const lines = [
      `PRE-CALL BRIEF: ${brief.business_name}`,
      `${brief.business_type} · ${brief.location}`,
      `Overall: ${brief.overall_grade}`,
      '',
      `SUGGESTED OPENING`,
      brief.suggested_opening,
      '',
      `GRADES`,
      `GBP: ${brief.grades.gbp.grade} | Reviews: ${brief.grades.reviews.grade} | Citations: ${brief.grades.citations.grade} | Website: ${brief.grades.website.grade} | Discoverability: ${brief.grades.discoverability.grade}`,
      '',
      `WEAKNESSES TO LEAD WITH`,
      ...brief.weaknesses_to_lead.map((w, i) => `${i + 1}. ${w}`),
      '',
      `STRENGTHS TO ACKNOWLEDGE`,
      ...brief.strengths_to_acknowledge.map((s, i) => `${i + 1}. ${s}`),
      '',
      `KEY TALKING POINTS`,
      brief.key_talking_points,
      '',
      `RED FLAGS`,
      ...brief.red_flags.map(r => `• ${r}`),
      '',
      `CONTACT`,
      `Phone: ${brief.contact.phone}`,
      `Website: ${brief.contact.website}`,
      `Address: ${brief.contact.address}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#1a1a16', padding: '48px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8460a', marginBottom: '6px' }}>
              NextLocal AI — Internal
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '28px', color: '#ede9de', lineHeight: 1.1 }}>
              Brief Generator
            </h1>
          </div>
          {pageState === 'done' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={copyBrief}
                style={{ padding: '10px 16px', backgroundColor: copied ? '#22c55e' : '#c8460a', color: 'white', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
              >
                {copied ? 'Copied!' : 'Copy Brief'}
              </button>
              {reportId && (
                <a
                  href={`/report/${reportId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '10px 16px', backgroundColor: 'transparent', color: '#ede9de', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid rgba(237,233,222,0.3)', textDecoration: 'none' }}
                >
                  View Report →
                </a>
              )}
              <button
                onClick={reset}
                style={{ padding: '10px 16px', backgroundColor: 'transparent', color: '#6b6b5e', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid rgba(237,233,222,0.15)', cursor: 'pointer' }}
              >
                New Search
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Business name"
            required
            disabled={pageState === 'loading'}
            style={{ flex: '1 1 220px', padding: '12px 16px', backgroundColor: '#f5f2eb', border: 'none', fontFamily: 'monospace', fontSize: '14px', color: '#1a1a16', minWidth: '0' }}
          />
          <input
            type="text"
            value={cityState}
            onChange={e => setCityState(e.target.value)}
            placeholder="City, State (e.g. Austin, TX)"
            required
            disabled={pageState === 'loading'}
            style={{ flex: '1 1 200px', padding: '12px 16px', backgroundColor: '#f5f2eb', border: 'none', fontFamily: 'monospace', fontSize: '14px', color: '#1a1a16', minWidth: '0' }}
          />
          <button
            type="submit"
            disabled={pageState === 'loading'}
            style={{ padding: '12px 24px', backgroundColor: pageState === 'loading' ? '#6b6b5e' : '#c8460a', color: 'white', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: pageState === 'loading' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {pageState === 'loading' ? 'Generating...' : 'Run Brief →'}
          </button>
        </form>

        {/* Loading */}
        {pageState === 'loading' && (
          <div style={{ padding: '40px', borderTop: '1px solid rgba(237,233,222,0.1)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b6b5e', animation: 'nlPulse 1.5s ease-in-out infinite' }}>
              Pulling GBP data · analyzing website · building brief...
            </p>
          </div>
        )}

        {/* Error */}
        {pageState === 'error' && (
          <div style={{ padding: '20px', border: '1px solid #c8460a', backgroundColor: 'rgba(200,70,10,0.1)' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c8460a' }}>{error}</p>
          </div>
        )}

        {/* Brief Output */}
        {pageState === 'done' && brief && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Business header */}
            <div style={{ borderBottom: '1px solid rgba(237,233,222,0.15)', paddingBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '32px', color: '#ede9de', marginBottom: '4px' }}>
                {brief.business_name}
              </h2>
              <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b5e', letterSpacing: '0.1em' }}>
                {brief.business_type} · {brief.location}
              </p>
            </div>

            {/* Grade cards */}
            <div>
              <SectionLabel>Grades — click to expand</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                <GradeCard label="Overall" block={brief.grades.overall} />
                <GradeCard label="Google Business Profile" block={brief.grades.gbp} />
                <GradeCard label="Reviews" block={brief.grades.reviews} />
                <GradeCard label="Citations" block={brief.grades.citations} />
                <GradeCard label="Website" block={brief.grades.website} />
                <GradeCard label="Discoverability" block={brief.grades.discoverability} />
              </div>
            </div>

            {/* Suggested opening */}
            <div>
              <SectionLabel>Suggested Opening Line</SectionLabel>
              <blockquote style={{ marginTop: '12px', borderLeft: '3px solid #c8460a', paddingLeft: '20px' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', lineHeight: 1.65, color: '#ede9de', fontStyle: 'italic', fontWeight: 300 }}>
                  &ldquo;{brief.suggested_opening}&rdquo;
                </p>
              </blockquote>
            </div>

            {/* What's working / Gaps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <SectionLabel>What&apos;s Working</SectionLabel>
                <ul style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                  {brief.whats_working.map((item, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de', lineHeight: 1.5, paddingLeft: '12px', borderLeft: '2px solid #22c55e' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <SectionLabel>Gaps to Fix</SectionLabel>
                <ul style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                  {brief.gaps_to_fix.map((item, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de', lineHeight: 1.5, paddingLeft: '12px', borderLeft: '2px solid #c8460a' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Weaknesses / Strengths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <SectionLabel>Weaknesses to Lead With</SectionLabel>
                <ol style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, counterReset: 'item' }}>
                  {brief.weaknesses_to_lead.map((item, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de', lineHeight: 1.5, display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#c8460a', flexShrink: 0 }}>0{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <SectionLabel>Strengths to Acknowledge</SectionLabel>
                <ul style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                  {brief.strengths_to_acknowledge.map((item, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de', lineHeight: 1.5, paddingLeft: '12px', borderLeft: '2px solid #6b6b5e' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key talking points */}
            <div>
              <SectionLabel>Key Talking Points</SectionLabel>
              <p style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#ede9de', lineHeight: 1.75, backgroundColor: 'rgba(237,233,222,0.05)', padding: '20px' }}>
                {brief.key_talking_points}
              </p>
            </div>

            {/* Red flags */}
            {brief.red_flags?.length > 0 && (
              <div>
                <SectionLabel>Red Flags / Urgency Signals</SectionLabel>
                <ul style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                  {brief.red_flags.map((flag, i) => (
                    <li key={i} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#fbbf24', lineHeight: 1.5, paddingLeft: '12px', borderLeft: '2px solid #fbbf24' }}>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Visibility */}
            {aiVisibility && (
              <div>
                <SectionLabel>AI Visibility — What They Actually Say</SectionLabel>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(['chatgpt', 'perplexity'] as const).map(platform => {
                    const result = aiVisibility[platform];
                    const label = platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity';
                    return (
                      <div key={platform} style={{ border: `1px solid ${result.mentioned ? 'rgba(34,197,94,0.4)' : 'rgba(237,233,222,0.15)'}`, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 14px', backgroundColor: result.mentioned ? 'rgba(34,197,94,0.1)' : 'rgba(237,233,222,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ede9de' }}>{label}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: result.mentioned ? '#22c55e' : '#f87171', fontWeight: 600 }}>
                            {result.error ? 'Error' : result.mentioned ? '✓ Mentioned' : '✗ Not mentioned'}
                          </span>
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#6b6b5e', marginBottom: '8px', fontStyle: 'italic' }}>
                            Query: &ldquo;{result.query}&rdquo;
                          </p>
                          {result.error ? (
                            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#f87171' }}>{result.error}</p>
                          ) : (
                            <div
                              style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de', lineHeight: 1.75 }}
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(result.response) }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact */}
            <div style={{ borderTop: '1px solid rgba(237,233,222,0.15)', paddingTop: '24px' }}>
              <SectionLabel>Contact</SectionLabel>
              <div style={{ marginTop: '12px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Phone', value: brief.contact.phone },
                  { label: 'Website', value: brief.contact.website },
                  { label: 'Address', value: brief.contact.address },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6b5e', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ede9de' }}>{value || 'Not found'}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes nlPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b6b5e' }}>
      {children}
    </p>
  );
}
