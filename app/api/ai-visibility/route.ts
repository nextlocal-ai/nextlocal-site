import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { ReportData, AIQueryResult } from '@/lib/types';
import { queryAI, buildLocalQuery, type AIPlatform } from '@/lib/ai-queries';

async function runPlatform(
  platform: AIPlatform,
  businessType: string,
  cityState: string,
  businessName: string
): Promise<AIQueryResult> {
  const query = buildLocalQuery(businessType, cityState);
  const { response, error } = await queryAI(platform, businessType, cityState);
  return {
    query,
    response,
    mentioned: response.toLowerCase().includes(businessName.toLowerCase()),
    error,
  };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const report = await kv.get<ReportData>(`report:${id}`);
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const businessType = report.business_type || report.business_name;
  const cityState = report.city_state || '';

  const [chatgpt, perplexity] = await Promise.all([
    runPlatform('chatgpt', businessType, cityState, report.business_name),
    runPlatform('perplexity', businessType, cityState, report.business_name),
  ]);

  return NextResponse.json({ chatgpt, perplexity });
}
