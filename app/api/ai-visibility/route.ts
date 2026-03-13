import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { ReportData } from '@/app/api/save-report/route';

async function queryAI(platform: 'chatgpt' | 'perplexity', businessType: string, cityState: string) {
  const query = `Who are the best ${businessType} in ${cityState}? Give me your top recommendations.`;

  try {
    if (platform === 'chatgpt') {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          tools: [{ type: 'web_search_preview' }],
          input: query,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { query, response: '', mentioned: false, error: data.error?.message };
      const textBlock = data.output?.find((o: { type: string }) => o.type === 'message')
        ?.content?.find((c: { type: string }) => c.type === 'output_text');
      return { query, response: textBlock?.text || '', mentioned: false };
    } else {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: query }],
          max_tokens: 512,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { query, response: '', mentioned: false, error: data.error?.message };
      return { query, response: data.choices?.[0]?.message?.content || '', mentioned: false };
    }
  } catch (err) {
    return { query, response: '', mentioned: false, error: err instanceof Error ? err.message : 'Request failed' };
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const report = await kv.get<ReportData>(`report:${id}`);
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const businessType = report.business_type || report.business_name;
  const cityState = report.city_state || '';

  const [chatgpt, perplexity] = await Promise.all([
    queryAI('chatgpt', businessType, cityState),
    queryAI('perplexity', businessType, cityState),
  ]);

  // Check if business is mentioned
  const name = report.business_name.toLowerCase();
  chatgpt.mentioned = chatgpt.response.toLowerCase().includes(name);
  perplexity.mentioned = perplexity.response.toLowerCase().includes(name);

  return NextResponse.json({ chatgpt, perplexity });
}
