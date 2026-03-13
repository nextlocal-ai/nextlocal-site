'use client';
import { useState } from 'react';

const BUSINESS_TYPES = [
  'Plumber', 'HVAC', 'Electrician', 'Roofer', 'Contractor',
  'Landscaper', 'Dentist', 'Chiropractor', 'Lawyer', 'Real Estate Agent',
  'Accountant', 'Financial Advisor', 'Auto Repair', 'Pest Control', 'Cleaning Service',
  'Other',
];

type State = 'idle' | 'loading' | 'done' | 'error';

export default function InternalPage() {
  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
    city: '',
    state: '',
    website: '',
  });
  const [status, setStatus] = useState<State>('idle');
  const [reportUrl, setReportUrl] = useState('');
  const [error, setError] = useState('');

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const res = await fetch('/api/internal-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setStatus('error');
      return;
    }

    setReportUrl(data.report_url);
    setStatus('done');
  }

  function reset() {
    setForm({ business_name: '', business_type: '', city: '', state: '', website: '' });
    setStatus('idle');
    setReportUrl('');
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#1a1a16', padding: '48px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8460a', marginBottom: '8px' }}>
            NextLocal AI — Internal Tool
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '32px', color: '#ede9de', lineHeight: 1.1 }}>
            Run a Report
          </h1>
        </div>

        {status === 'done' ? (
          <div style={{ backgroundColor: '#f5f2eb', padding: '40px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6b5e', marginBottom: '16px' }}>
              Report Ready
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 900, color: '#1a1a16', marginBottom: '24px' }}>
              {form.business_name}
            </p>
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', padding: '14px 24px', backgroundColor: '#c8460a',
                color: 'white', fontFamily: 'monospace', fontSize: '11px',
                letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none',
                textAlign: 'center', marginBottom: '12px',
              }}
            >
              View Report →
            </a>
            <button
              onClick={reset}
              style={{
                width: '100%', padding: '14px', backgroundColor: 'transparent',
                border: '2px solid #1a1a16', color: '#1a1a16', fontFamily: 'monospace',
                fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Run Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5f2eb', padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Business Name" required>
              <input
                type="text"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                placeholder="Austin Plumbing Co."
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Business Type" required>
              <select
                value={form.business_type}
                onChange={e => set('business_type', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select type...</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="City" required>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Austin"
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="State">
                <input
                  type="text"
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  placeholder="TX"
                  maxLength={2}
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Website">
              <input
                type="url"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </Field>

            {status === 'error' && (
              <p style={{ color: '#c8460a', fontFamily: 'monospace', fontSize: '12px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '14px', backgroundColor: status === 'loading' ? '#6b6b5e' : '#1a1a16',
                color: '#f5f2eb', fontFamily: 'monospace', fontSize: '11px',
                letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer', marginTop: '8px',
              }}
            >
              {status === 'loading' ? 'Running audit...' : 'Run Report →'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6b5e' }}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '2px solid #1a1a16', backgroundColor: 'white',
  fontFamily: 'monospace', fontSize: '14px', width: '100%', boxSizing: 'border-box',
};
