'use server';

import { headers } from 'next/headers';

export async function generateBrief(businessName: string, cityState: string) {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) {
    return { error: 'INTERNAL_API_KEY not configured' };
  }

  const h = await headers();
  const host = h.get('host');
  const protocol = h.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;

  try {
    const res = await fetch(`${origin}/api/internal-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': apiKey,
      },
      body: JSON.stringify({ business_name: businessName, city_state: cityState }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || `HTTP ${res.status}` };
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Request failed' };
  }
}
