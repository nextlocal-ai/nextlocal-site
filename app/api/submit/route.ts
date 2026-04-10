import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://hook.us2.make.com/ryxzfq6q5oswd67fxyvyxx5mw61jy3h3';

const REQUIRED_FIELDS = ['firstName', 'lastName', 'businessName', 'businessType', 'email', 'city', 'state'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const missing = REQUIRED_FIELDS.filter(f => !body[f]?.toString().trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const makeRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!makeRes.ok) {
      const detail = await makeRes.text().catch(() => '');
      return NextResponse.json(
        { error: `Webhook returned ${makeRes.status}`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
