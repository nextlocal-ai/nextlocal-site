import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';
import type { ReportData } from '@/app/api/save-report/route';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    let { business_name, business_type, city, state, website } = await req.json();
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;

    if (!business_name || !business_type || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const location = state ? `${city}, ${state}` : city;

    const prompt = `You are an AI visibility analyst. Grade the following local business on their AI search visibility.

Business: ${business_name}
Type: ${business_type}
Location: ${location}
Website: ${website || 'Not provided'}

Grade each category from A to F based on what you can reasonably infer about a typical ${business_type} in ${location}. Be honest and critical — most local businesses have significant gaps.

Categories to grade:
- gbp_grade: Google Business Profile quality (completeness, photos, posts, Q&A)
- reviews_grade: Review count, rating, recency, and owner responses
- citations_grade: NAP consistency across directories (Yelp, BBB, Apple Maps, etc.)
- website_grade: Schema markup, mobile optimization, structured data, content quality
- ai_grade: Entity presence, Wikipedia/Reddit/LinkedIn mentions, AI recommendation likelihood

Return ONLY valid JSON in this exact format:
{
  "overall_grade": "C",
  "gbp_grade": "B",
  "reviews_grade": "C",
  "citations_grade": "D",
  "website_grade": "C",
  "ai_grade": "F",
  "narrative": "2-3 sentence summary of their AI visibility situation, specific to this business type and market.",
  "action_1": "First most important action to take, specific and actionable.",
  "action_2": "Second priority action.",
  "action_3": "Third priority action."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Claude response');

    const grades = JSON.parse(jsonMatch[0]);

    const id = randomUUID().replace(/-/g, '').slice(0, 12);
    const report: ReportData & { source: string } = {
      business_name,
      ...grades,
      created_at: new Date().toISOString(),
      source: 'internal',
    };

    await kv.set(`report:${id}`, report, { ex: 60 * 60 * 24 * 30 });

    return NextResponse.json({ id, report_url: `/report/${id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
