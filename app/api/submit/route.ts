import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://hook.us2.make.com/ryxzfq6q5oswd67fxyvyxx5mw61jy3h3';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
