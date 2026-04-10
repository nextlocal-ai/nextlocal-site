import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { ReportData } from '@/lib/types';

// camelCase / "Title Case" / "snake_case" → snake_case
function normalizeKey(k: string): string {
  return k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/ /g, '_').replace(/^_/, '').replace(/_+$/, '');
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.MAKE_WEBHOOK_SECRET;
    if (!expectedSecret || req.headers.get('x-nl-secret') !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let raw: Record<string, unknown>;
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      raw = Object.fromEntries(new URLSearchParams(text));
    } else {
      // Try JSON first; fall back to URL-encoded if parsing fails (Make Content-Type mismatch)
      const text = await req.text();
      try {
        raw = JSON.parse(text) as Record<string, unknown>;
      } catch {
        raw = Object.fromEntries(new URLSearchParams(text));
      }
    }

    // Unwrap Make data structure nesting: { SaveReport: { ... } } → { ... }
    const vals = Object.values(raw);
    const flat: Record<string, string> =
      Object.keys(raw).length === 1 && vals[0] !== null && typeof vals[0] === 'object' && !Array.isArray(vals[0])
        ? (vals[0] as Record<string, string>)
        : (raw as Record<string, string>);

    // Normalize all keys to snake_case
    const body: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) {
      body[normalizeKey(k)] = String(v ?? '');
    }

    const { session_id, city, state, ...reportFields } = body;
    if (!reportFields.business_name?.trim()) {
      return NextResponse.json({ error: 'Missing business_name' }, { status: 400 });
    }
    if (!reportFields.narrative?.trim()) {
      return NextResponse.json({ error: 'Missing narrative' }, { status: 400 });
    }

    const id = randomUUID().replace(/-/g, '').slice(0, 12);

    const report: ReportData = {
      business_name: reportFields.business_name,
      narrative: reportFields.narrative,
      action_1: reportFields.action_1 || '',
      action_2: reportFields.action_2 || '',
      action_3: reportFields.action_3 || '',
      overall_grade: reportFields.overall_grade || undefined,
      gbp_grade: reportFields.gbp_grade || undefined,
      reviews_grade: reportFields.reviews_grade || undefined,
      citations_grade: reportFields.citations_grade || undefined,
      website_grade: reportFields.website_grade || undefined,
      ai_grade: reportFields.ai_grade || undefined,
      business_type: reportFields.business_type || undefined,
      city_state: city && state ? `${city}, ${state}` : (reportFields.city_state || undefined),
      created_at: new Date().toISOString(),
    };

    await kv.set(`report:${id}`, report, { ex: 60 * 60 * 24 * 30 });

    if (session_id) {
      await kv.set(`session:${session_id}`, id, { ex: 60 * 60 * 24 });
    }

    return NextResponse.json(
      { id, report_url: `/report/${id}`, received_session_id: session_id || null },
      { headers: { 'X-Report-Id': id, 'X-Report-Url': `https://nextlocal.ai/report/${id}` } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
