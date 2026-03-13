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
  return NextResponse.json({
    ok: true,
    has_url: !!process.env.KV_REST_API_URL,
    has_token: !!process.env.KV_REST_API_TOKEN,
  });
}

// camelCase / "Title Case" / "snake_case" → snake_case
function normalizeKey(k: string): string {
  return k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/ /g, '_').replace(/^_/, '');
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json() as Record<string, unknown>;

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

    return NextResponse.json({ id, report_url: `/report/${id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
