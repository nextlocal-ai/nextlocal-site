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

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, string>;
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await req.json();
    }
    // Unwrap Make data structure nesting if present (e.g. { SaveReport: { ... } })
    const firstVal = Object.values(body)[0];
    const unwrapped: Record<string, string> = Object.keys(body).length === 1 && typeof firstVal === 'object' && firstVal !== null
      ? firstVal as unknown as Record<string, string>
      : body;

    // Normalize keys: camelCase and "Title Case" → snake_case
    function normalizeKey(k: string): string {
      return k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/ /g, '_').replace(/^_/, '');
    }
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(unwrapped)) {
      normalized[normalizeKey(k)] = v as string;
    }

    const { session_id, city, state, ...reportFields } = normalized;

    // Generate a short random ID
    const id = randomUUID().replace(/-/g, '').slice(0, 12);

    const report = {
      ...reportFields,
      city_state: city && state ? `${city}, ${state}` : (reportFields.city_state || ''),
      created_at: new Date().toISOString(),
    };

    // Store report for 30 days
    await kv.set(`report:${id}`, report, { ex: 60 * 60 * 24 * 30 });

    // If a session_id was provided, store the mapping so the polling page can find it
    if (session_id) {
      await kv.set(`session:${session_id}`, id, { ex: 60 * 60 * 24 });
    }

    return NextResponse.json({ id, report_url: `/report/${id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
