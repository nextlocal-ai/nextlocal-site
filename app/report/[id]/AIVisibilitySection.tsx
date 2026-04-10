'use client';

import { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/render-markdown';
import type { AIQueryResult } from '@/lib/types';

interface Props {
  reportId: string;
  businessName: string;
  businessType?: string;
  cityState?: string;
}

const SAMPLE_QUERIES = [
  (type: string, city: string) => `Who are the best ${type}s in ${city}?`,
  (type: string, city: string) => `Best ${type} near ${city}`,
  (type: string, city: string) => `Top-rated ${type} in ${city}`,
  (type: string, city: string) => `Recommend a ${type} in ${city}`,
];

function MentionBadge({ mentioned, loading }: { mentioned?: boolean; loading: boolean }) {
  if (loading) return (
    <span style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '11px', color: 'var(--color-muted)' }}>
      checking...
    </span>
  );
  return (
    <span style={{
      fontFamily: 'var(--font-ibm-plex-mono), monospace',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
      color: mentioned ? '#22c55e' : 'var(--color-orange)',
    }}>
      {mentioned ? '✓ You appear' : '✗ Not found'}
    </span>
  );
}

function TerminalBox({ businessType, cityState }: { businessType: string; cityState: string }) {
  const [queryIndex, setQueryIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const currentQuery = SAMPLE_QUERIES[queryIndex % SAMPLE_QUERIES.length](businessType, cityState);

  useEffect(() => {
    if (charIndex < currentQuery.length) {
      const t = setTimeout(() => {
        setDisplayed(currentQuery.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 35);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setQueryIndex(i => i + 1);
        setCharIndex(0);
        setDisplayed('');
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [charIndex, currentQuery]);

  return (
    <div style={{
      backgroundColor: 'var(--color-ink)', borderRadius: '6px', padding: '16px 20px',
      fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '13px',
      color: 'var(--color-muted)', lineHeight: 1.5,
    }}>
      <div style={{ marginBottom: '8px', display: 'flex', gap: '6px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-orange)', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-muted)', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-muted)', display: 'inline-block' }} />
      </div>
      <span style={{ color: 'var(--color-orange)' }}>$ </span>
      <span style={{ color: 'var(--color-cream2)' }}>{displayed}</span>
      <span style={{ animation: 'nlBlink 1s step-end infinite', color: 'var(--color-orange)' }}>▋</span>
      <style>{`@keyframes nlBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

function ResultPanel({ label, result, loading }: { label: string; result?: AIQueryResult; loading: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: '1px solid rgba(26,26,22,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={() => !loading && result && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          backgroundColor: result?.mentioned ? 'rgba(34,197,94,0.05)' : loading ? 'var(--color-cream)' : 'rgba(200,70,10,0.04)',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        <span style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink)' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MentionBadge mentioned={result?.mentioned} loading={loading} />
          {!loading && result && (
            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{open ? '▲' : '▼'}</span>
          )}
        </div>
      </div>
      {open && result && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(26,26,22,0.1)', backgroundColor: '#fafaf7' }}>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '10px', color: 'var(--color-muted)', marginBottom: '10px', fontStyle: 'italic' }}>
            Query: &ldquo;{result.query}&rdquo;
          </p>
          {result.error ? (
            <p style={{ fontSize: '13px', color: 'var(--color-orange)' }}>{result.error}</p>
          ) : (
            <div
              style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result.response) }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function AIVisibilitySection({ reportId, businessName, businessType, cityState }: Props) {
  const [loading, setLoading] = useState(true);
  const [chatgpt, setChatgpt] = useState<AIQueryResult | undefined>();
  const [perplexity, setPerplexity] = useState<AIQueryResult | undefined>();
  const [fetchError, setFetchError] = useState(false);
  const type = businessType || businessName;
  const city = cityState || '';

  useEffect(() => {
    fetch(`/api/ai-visibility?id=${reportId}`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setChatgpt(data.chatgpt);
        setPerplexity(data.perplexity);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [reportId]);

  return (
    <section style={{ borderBottom: '2px solid var(--color-ink)' }}>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Label column */}
        <div className="px-8 md:px-8 py-10 md:py-12 flex flex-row md:flex-col justify-between items-start md:items-stretch"
          style={{ borderBottom: '2px solid var(--color-ink)', backgroundColor: 'var(--color-ink)', minHeight: '120px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.1, color: 'var(--color-cream)' }}>
            What AI says.
          </h2>
          <span className="hidden md:block" style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--color-muted)', writingMode: 'vertical-rl',
            transform: 'rotate(180deg)', alignSelf: 'flex-end',
          }}>
            AI Visibility
          </span>
        </div>

        {/* Content column */}
        <div className="px-8 md:px-14 py-10 md:py-12 flex flex-col gap-4" style={{ backgroundColor: 'var(--color-cream)' }}>
          {loading && (
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px' }}>
                Querying AI assistants now…
              </p>
              <TerminalBox businessType={type} cityState={city} />
            </div>
          )}
          {fetchError ? (
            <p style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '12px', color: 'var(--color-orange)', border: '1px solid var(--color-orange)', padding: '14px 18px' }}>
              Couldn&apos;t reach the AI visibility check. Refresh to try again — if this keeps happening, email hello@nextlocal.ai.
            </p>
          ) : (
            <>
              <ResultPanel label="ChatGPT" result={chatgpt} loading={loading} />
              <ResultPanel label="Perplexity" result={perplexity} loading={loading} />
              <p style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '10px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Click a result to see the full AI response. ↑
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
