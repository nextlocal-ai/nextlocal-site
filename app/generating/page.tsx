'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const STEPS = [
  {
    label: 'Pulling your Google Business Profile',
    detail: 'Connecting to Google Places API...',
    start: 0, end: 2000, pctStart: 0, pctEnd: 15,
  },
  {
    label: 'Scanning citation sources',
    detail: 'Yelp, Bing, Apple Maps, Facebook...',
    start: 2000, end: 5000, pctStart: 15, pctEnd: 35,
  },
  {
    label: 'Analyzing your website signals',
    detail: 'Schema markup, entity data, content structure...',
    start: 5000, end: 8000, pctStart: 35, pctEnd: 60,
  },
  {
    label: 'Evaluating discoverability signals',
    detail: 'Entity footprint, directory presence, authority signals...',
    start: 8000, end: 11000, pctStart: 60, pctEnd: 80,
  },
  {
    label: 'Building your personalized report',
    detail: 'Scoring, grading, competitor comparison...',
    start: 11000, end: 14000, pctStart: 80, pctEnd: 95,
  },
];

const COUNTER_LABELS = [
  'Pulling profile\ndata',
  'Scanning\ncitations',
  'Analyzing\nwebsite signals',
  'Evaluating\ndiscoverability',
  'Building your\nreport',
];

type StepState = 'idle' | 'active' | 'done';

function GeneratingContent() {
  const searchParams = useSearchParams();
  const bizName = searchParams.get('business_name') || searchParams.get('name') || 'Your Business';
  const reportId = searchParams.get('report_id');
  const reportUrl = searchParams.get('report_url') || (reportId ? `/report/${reportId}` : null);
  const submissionId = searchParams.get('submission_id');

  const [stepStates, setStepStates] = useState<StepState[]>(['idle', 'idle', 'idle', 'idle', 'idle']);
  const [pct, setPct] = useState(0);
  const [counterLabel, setCounterLabel] = useState('Initializing\nanalysis');
  const [showOverlay, setShowOverlay] = useState(false);

  const redirectedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const currentStepRef = useRef(-1);

  const doRedirect = useCallback((url: string) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setPct(100);
    setStepStates(['done', 'done', 'done', 'done', 'done']);
    setCounterLabel('Report\nready');
    setTimeout(() => {
      setShowOverlay(true);
      setTimeout(() => { window.location.href = url; }, 800);
    }, 400);
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();

    function animate() {
      const elapsed = Date.now() - startTimeRef.current;

      let matched = false;
      for (let i = 0; i < STEPS.length; i++) {
        const s = STEPS[i];
        if (elapsed >= s.start && elapsed < s.end) {
          if (i !== currentStepRef.current) {
            currentStepRef.current = i;
            setStepStates(prev => {
              const next = [...prev] as StepState[];
              if (i > 0) next[i - 1] = 'done';
              next[i] = 'active';
              return next;
            });
            setCounterLabel(COUNTER_LABELS[i]);
          }
          const progress = (elapsed - s.start) / (s.end - s.start);
          setPct(s.pctStart + (s.pctEnd - s.pctStart) * progress);
          matched = true;
          break;
        }
      }

      if (!matched && elapsed >= 14000 && !redirectedRef.current) {
        if (currentStepRef.current !== 4) {
          currentStepRef.current = 4;
          setStepStates(['done', 'done', 'done', 'done', 'active']);
        }
        setPct(95);
        setCounterLabel('Finalizing\nreport');
      }

      if (!redirectedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // If report_url passed directly, redirect after animation completes
  useEffect(() => {
    if (!reportUrl) return;
    const t = setTimeout(() => doRedirect(reportUrl), 14000);
    return () => clearTimeout(t);
  }, [reportUrl, doRedirect]);

  // Poll /api/submission-status if submission_id given
  useEffect(() => {
    if (!submissionId || reportUrl) return;
    let pollCount = 0;
    const maxPolls = 90;
    let timeoutId: ReturnType<typeof setTimeout>;

    function poll() {
      if (redirectedRef.current) return;
      pollCount++;
      if (pollCount > maxPolls) return;

      fetch(`/api/submission-status?id=${submissionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.redirect_url) {
            doRedirect(data.redirect_url);
          } else {
            timeoutId = setTimeout(poll, 2000);
          }
        })
        .catch(() => { timeoutId = setTimeout(poll, 2000); });
    }

    timeoutId = setTimeout(poll, 3000);
    return () => clearTimeout(timeoutId);
  }, [submissionId, reportUrl, doRedirect]);

  const labelLines = counterLabel.split('\n');

  return (
    <>
      {/* grid texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(26,26,22,0.04) 39px, rgba(26,26,22,0.04) 40px)',
          'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(26,26,22,0.04) 39px, rgba(26,26,22,0.04) 40px)',
        ].join(', '),
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '560px' }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#6b6b5e', marginBottom: '48px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px', backgroundColor: '#c8460a',
            borderRadius: '50%', display: 'inline-block',
            animation: 'nlPulse 2s ease-in-out infinite',
          }} />
          Next<strong style={{ color: '#c8460a' }}>Local</strong> AI
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
          fontSize: 'clamp(32px, 6vw, 48px)', lineHeight: 1.05,
          color: '#1a1a16', marginBottom: '8px',
        }}>
          Analyzing
          <span style={{ color: '#c8460a', display: 'block' }}>{bizName}</span>
        </h1>
        <div style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '12px', letterSpacing: '0.08em',
          color: '#6b6b5e', marginBottom: '48px', textTransform: 'uppercase',
        }}>
          AI Visibility Report · Generating Now
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '2px', background: '#ede9de',
          border: '1px solid #1a1a16', marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: '#1a1a16',
            width: `${pct}%`,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', right: 0, top: '-2px',
              width: '6px', height: '6px',
              background: '#c8460a', borderRadius: '50%', display: 'block',
            }} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '48px' }}>
          {STEPS.map((step, i) => {
            const state = stepStates[i];
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '14px 0',
                borderBottom: '1px solid rgba(26,26,22,0.1)',
                borderTop: i === 0 ? '1px solid rgba(26,26,22,0.1)' : undefined,
                opacity: state === 'idle' ? 0.3 : state === 'done' ? 0.5 : 1,
                transition: 'opacity 0.4s ease',
              }}>
                <div style={{
                  width: '20px', height: '20px',
                  border: `1.5px solid ${state === 'active' ? '#c8460a' : '#1a1a16'}`,
                  borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: state === 'done' ? '#1a1a16' : 'transparent',
                  transition: 'all 0.3s ease',
                }}>
                  {state === 'active' && (
                    <span style={{
                      width: '6px', height: '6px', background: '#c8460a',
                      borderRadius: '50%', display: 'block',
                      animation: 'nlStepPulse 1s ease-in-out infinite',
                    }} />
                  )}
                  {state === 'done' && (
                    <span style={{ color: '#f5f2eb', fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>✓</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontWeight: 400, fontSize: '14px',
                    color: '#1a1a16', lineHeight: 1.3,
                  }}>{step.label}</div>
                  <div style={{
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                    fontSize: '10px', color: '#6b6b5e',
                    letterSpacing: '0.06em', marginTop: '3px',
                  }}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: '48px', color: '#1a1a16', lineHeight: 1,
          }}>
            {Math.round(pct)}<span style={{ fontSize: '24px', color: '#6b6b5e' }}>%</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#6b6b5e', textAlign: 'right', lineHeight: 1.6,
          }}>
            {labelLines[0]}<br />{labelLines[1] ?? ''}
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: '48px', paddingTop: '20px',
          borderTop: '1px solid rgba(26,26,22,0.12)',
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          fontSize: '10px', letterSpacing: '0.08em',
          color: '#6b6b5e', textTransform: 'uppercase',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Secure · Private · Free</span>
          <span>nextlocal.ai</span>
        </div>
      </div>

      {/* Redirect overlay */}
      {showOverlay && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: '#1a1a16',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'nlFadeIn 0.5s ease forwards',
        }}>
          <div style={{
            fontFamily: 'var(--font-playfair), serif', fontWeight: 900,
            fontSize: '32px', color: '#f5f2eb', textAlign: 'center',
          }}>
            Your report<br />
            <span style={{ color: '#c8460a' }}>is ready.</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes nlPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes nlStepPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes nlFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function GeneratingPage() {
  return (
    <main style={{
      backgroundColor: '#f5f2eb', color: '#1a1a16',
      fontFamily: 'var(--font-dm-sans), sans-serif', fontWeight: 300,
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', overflow: 'hidden', position: 'relative',
    }}>
      <Suspense fallback={null}>
        <GeneratingContent />
      </Suspense>
    </main>
  );
}
