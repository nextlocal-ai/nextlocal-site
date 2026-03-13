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
    const body = await req.json();
    const { session_id, ...reportFields } = body;

    // Generate a short random ID
    const id = randomUUID().replace(/-/g, '').slice(0, 12);

    const report: ReportData = {
      ...reportFields,
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
