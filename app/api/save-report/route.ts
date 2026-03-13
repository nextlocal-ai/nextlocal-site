import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export interface ReportData {
  business_name: string;
  overall_grade: string;
  gbp_grade: string;
  reviews_grade: string;
  citations_grade: string;
  website_grade: string;
  ai_grade: string;
  narrative: string;
  action_1: string;
  action_2: string;
  action_3: string;
  created_at: string;
  business_type?: string;
  city_state?: string;
}

export async function GET() {
  const debugInfo = await kv.get<Record<string, string>>('debug:last_save');
  return NextResponse.json({
    ok: true,
    has_url: !!process.env.KV_REST_API_URL,
    has_token: !!process.env.KV_REST_API_TOKEN,
    last_save: debugInfo ?? null,
  });
}

// camelCase / "Title Case" / "snake_case" → snake_case
function normalizeKey(k: string): string {
  return k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/ /g, '_').replace(/^_/, '').replace(/_+$/, '');
}

export async function POST(req: NextRequest) {
  try {
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

    console.log('[save-report] keys:', Object.keys(body).join(', '), '| session_id:', body.session_id);

    // Debug: store last call info so we can inspect what Make actually sent
    await kv.set('debug:last_save', {
      keys: Object.keys(body).join(','),
      session_id: body.session_id ?? '(missing)',
      content_type: contentType,
      ts: new Date().toISOString(),
    }, { ex: 3600 });

    const { session_id, city, state, ...reportFields } = body;
    const id = randomUUID().replace(/-/g, '').slice(0, 12);

    const report: ReportData = {
      ...(reportFields as Partial<ReportData>),
      city_state: city && state ? `${city}, ${state}` : (reportFields.city_state || ''),
      created_at: new Date().toISOString(),
    } as ReportData;

    await kv.set(`report:${id}`, report, { ex: 60 * 60 * 24 * 30 });

    if (session_id) {
      await kv.set(`session:${session_id}`, id, { ex: 60 * 60 * 24 });
      console.log('[save-report] session mapped:', session_id, '->', id);
    } else {
      console.log('[save-report] WARNING: no session_id received');
    }

    return NextResponse.json({ id, report_url: `/report/${id}`, received_session_id: session_id || null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
