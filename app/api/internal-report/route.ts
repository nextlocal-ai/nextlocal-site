import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';
import type { ReportData } from '@/app/api/save-report/route';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchWebsiteSignals(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NextLocalAI/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    const signals: string[] = [];

    // Schema markup
    const schemaMatches = html.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
    const schemaTypes = [...new Set(schemaMatches.map(m => m.match(/"([^"]+)"$/)?.[1]))].filter(Boolean);
    if (schemaTypes.length) signals.push(`Schema markup present: ${schemaTypes.join(', ')}`);
    else signals.push('No JSON-LD schema markup detected');

    // Meta tags
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    if (title) signals.push(`Page title: "${title}"`);

    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
    if (metaDesc) signals.push(`Meta description present (${metaDesc.length} chars)`);
    else signals.push('No meta description');

    // OG tags
    const hasOG = /<meta[^>]+property=["']og:/i.test(html);
    signals.push(hasOG ? 'Open Graph tags present' : 'No Open Graph tags');

    // Mobile viewport
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    signals.push(hasViewport ? 'Mobile viewport tag present' : 'No mobile viewport tag');

    // HTTPS
    signals.push(url.startsWith('https://') ? 'HTTPS enabled' : 'Not on HTTPS');

    // Heading structure
    const h1s = (html.match(/<h1[^>]*>/gi) || []).length;
    signals.push(`H1 tags: ${h1s}`);

    // Phone number presence
    const hasPhone = /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/.test(html);
    signals.push(hasPhone ? 'Phone number found on page' : 'No phone number detected');

    // Address/NAP
    const hasAddress = /<address|itemprop=["']address["']|streetAddress/i.test(html);
    signals.push(hasAddress ? 'Address markup found' : 'No address markup detected');

    return signals.join('\n');
  } catch {
    return 'Could not fetch website (timeout or blocked)';
  }
}

export async function POST(req: NextRequest) {
  try {
    let { business_name, business_type, city, state, website } = await req.json();
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;

    if (!business_name || !business_type || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const location = state ? `${city}, ${state}` : city;

    const websiteSignals = website
      ? await fetchWebsiteSignals(website)
      : 'No website provided';

    const prompt = `You are an AI visibility analyst. Grade the following local business on their AI search visibility.

Business: ${business_name}
Type: ${business_type}
Location: ${location}
Website: ${website || 'Not provided'}

WEBSITE ANALYSIS (actual signals detected):
${websiteSignals}

Grade each category from A to F. Use the actual website signals above for website_grade — do not guess. For other categories, use your knowledge of typical ${business_type} businesses in ${location}.

Categories:
- gbp_grade: Google Business Profile quality (completeness, photos, posts, Q&A)
- reviews_grade: Review count, rating, recency, and owner responses
- citations_grade: NAP consistency across Yelp, BBB, Apple Maps, etc.
- website_grade: Based ONLY on the actual signals detected above — schema, mobile, meta, structure
- ai_grade: Discoverability — entity presence on Wikipedia/Reddit/LinkedIn, sameAs structured data, news/press mentions, overall digital footprint

Return ONLY valid JSON:
{
  "overall_grade": "C",
  "gbp_grade": "B",
  "reviews_grade": "C",
  "citations_grade": "D",
  "website_grade": "C",
  "ai_grade": "F",
  "narrative": "2-3 sentence summary of their AI visibility situation.",
  "action_1": "Most important action, specific and actionable.",
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
