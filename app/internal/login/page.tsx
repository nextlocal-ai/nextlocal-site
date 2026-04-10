'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/internal-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/internal');
    } else {
      setError('Wrong password.');
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px', padding: '48px', backgroundColor: 'var(--color-cream)' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '24px' }}>
          NextLocal AI — Internal
        </p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          style={{
            width: '100%', padding: '12px', border: '2px solid var(--color-ink)',
            backgroundColor: 'white', fontFamily: 'monospace', fontSize: '14px',
            marginBottom: '12px', boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ color: 'var(--color-orange)', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%', padding: '12px', backgroundColor: 'var(--color-ink)',
            color: 'var(--color-cream)', fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
          }}
        >
          Enter →
        </button>
      </form>
    </main>
  );
}
