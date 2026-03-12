import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const reportId = await kv.get<string>(`session:${id}`);
  if (!reportId) {
    return NextResponse.json({ ready: false });
  }

  return NextResponse.json({
    ready: true,
    redirect_url: `/report/${reportId}`,
  });
}
