import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';
import type { ReportData } from '@/app/api/save-report/route';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

// ── AI Discoverability Queries ──────────────────────────────────

async function queryAI(platform: 'chatgpt' | 'perplexity', businessType: string, cityState: string): Promise<{ response: string; error?: string }> {
  const query = `Who are the best ${businessType}s in ${cityState}? Give me your top recommendations.`;

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
      if (!res.ok) {
        return { response: '', error: data.error?.message || `HTTP ${res.status}` };
      }
      const textBlock = data.output?.find((o: { type: string }) => o.type === 'message')
        ?.content?.find((c: { type: string }) => c.type === 'output_text');
      return { response: textBlock?.text || '' };
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
      return { response: data.choices?.[0]?.message?.content || '' };
    }
  } catch (err) {
    return { response: '', error: err instanceof Error ? err.message : 'Request failed' };
  }
}

// ── Google Places ──────────────────────────────────────────────

async function lookupBusiness(name: string, location: string) {
  if (!PLACES_KEY) return null;
  try {
    const query = encodeURIComponent(`${name} ${location}`);
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${PLACES_KEY}`
    );
    const searchData = await searchRes.json();
    const place = searchData.results?.[0];
    if (!place) return null;

    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,types,opening_hours,photos&key=${PLACES_KEY}`
    );
    const detailData = await detailRes.json();
    return detailData.result || null;
  } catch {
    return null;
  }
}

// ── Website signals ────────────────────────────────────────────

async function fetchWebsiteSignals(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NextLocalAI/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const signals: string[] = [];

    const schemaTypes = [...new Set(
      (html.match(/"@type"\s*:\s*"([^"]+)"/g) || [])
        .map(m => m.match(/"([^"]+)"$/)?.[1])
        .filter(Boolean)
    )];
    signals.push(schemaTypes.length
      ? `Schema markup: ${schemaTypes.join(', ')}`
      : 'No JSON-LD schema markup');

    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    if (title) signals.push(`Title: "${title}"`);

    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,})["']/i)?.[1];
    signals.push(metaDesc ? `Meta description: ${metaDesc.length} chars` : 'No meta description');

    signals.push(/<meta[^>]+property=["']og:/i.test(html) ? 'Open Graph tags present' : 'No Open Graph tags');
    signals.push(/<meta[^>]+name=["']viewport["']/i.test(html) ? 'Mobile viewport present' : 'No mobile viewport');
    signals.push(url.startsWith('https') ? 'HTTPS' : 'HTTP only');

    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    signals.push(`H1 tags: ${h1Count}`);

    signals.push(/(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/.test(html) ? 'Phone number on page' : 'No phone number on page');
    signals.push(/<address|itemprop=["']address["']|streetAddress/i.test(html) ? 'Address markup found' : 'No address markup');
    signals.push(/LocalBusiness|Organization/i.test(html) ? 'LocalBusiness/Organization schema' : 'No LocalBusiness schema');
    signals.push(/faq|FAQ/i.test(html) ? 'FAQ content detected' : 'No FAQ section');

    return signals.join('\n');
  } catch {
    return 'Could not fetch website (timeout or access blocked)';
  }
}

// ── Citations check ────────────────────────────────────────────

async function checkCitations(businessName: string, cityState: string): Promise<{ grade: string; found: string[]; missing: string[]; summary: string }> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return { grade: 'N/A', found: [], missing: [], summary: 'SERPAPI_KEY not configured' };

  const directories = [
    { label: 'Yelp', site: 'yelp.com' },
    { label: 'BBB', site: 'bbb.org' },
    { label: 'Apple Maps', site: 'maps.apple.com' },
    { label: 'Bing Places', site: 'bing.com/maps' },
    { label: 'Yellow Pages', site: 'yellowpages.com' },
  ];

  const results = await Promise.all(
    directories.map(async ({ label, site }) => {
      const query = `"${businessName}" "${cityState}" site:${site}`;
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=3&api_key=${apiKey}`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const data = await res.json();
        const found = Array.isArray(data.organic_results) && data.organic_results.length > 0;
        return { label, found };
      } catch {
        return { label, found: false };
      }
    })
  );

  const found = results.filter(r => r.found).map(r => r.label);
  const missing = results.filter(r => !r.found).map(r => r.label);
  const score = found.length / directories.length;
  const grade = score >= 1.0 ? 'A' : score >= 0.8 ? 'B' : score >= 0.6 ? 'C' : score >= 0.4 ? 'D' : 'F';

  return {
    grade,
    found,
    missing,
    summary: `Found on ${found.length}/${directories.length} directories. Present: ${found.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}.`,
  };
}

// ── Main handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const expectedKey = process.env.INTERNAL_API_KEY;
    const headerValid = !!expectedKey && req.headers.get('x-internal-key') === expectedKey;
    const cookieValid = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!headerValid && !cookieValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_name, city_state } = await req.json();
    if (!business_name || !city_state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Google Places lookup
    const place = await lookupBusiness(business_name, city_state);

    const gbpSummary = place ? `
- Name: ${place.name}
- Address: ${place.formatted_address || 'Not found'}
- Phone: ${place.formatted_phone_number || 'Not found'}
- Website: ${place.website || 'Not found'}
- Rating: ${place.rating || 'No rating'} (${place.user_ratings_total || 0} reviews)
- Business status: ${place.business_status || 'Unknown'}
- Has photos: ${place.photos?.length > 0 ? `Yes (${place.photos.length})` : 'No'}
- Has hours: ${place.opening_hours ? 'Yes' : 'No'}
- Types: ${place.types?.join(', ') || 'Unknown'}
`.trim() : 'Business not found on Google — no GBP data available';

    const websiteUrl = place?.website;
    const [websiteSignals, citations] = await Promise.all([
      websiteUrl ? fetchWebsiteSignals(websiteUrl) : Promise.resolve('No website found'),
      checkCitations(business_name, city_state),
    ]);

    const prompt = `You are a sales intelligence analyst for NextLocal AI, an AI visibility optimization agency. Generate a pre-call brief for this prospect.

BUSINESS: ${business_name}
LOCATION: ${city_state}

GOOGLE BUSINESS PROFILE DATA:
${gbpSummary}

WEBSITE SIGNALS:
${websiteSignals}

CITATION DATA (real directory checks):
${citations.summary}
Use this for the citations grade — do not infer. Grade: ${citations.grade}

Generate a detailed sales brief. Return ONLY valid JSON matching this exact structure:

{
  "business_name": "exact name from GBP or as provided",
  "business_type": "inferred category",
  "location": "${city_state}",
  "overall_grade": "letter grade A-F with optional +/-",
  "grades": {
    "overall": {
      "grade": "D+",
      "specifics": ["specific reason 1", "specific reason 2", "specific reason 3"]
    },
    "gbp": {
      "grade": "D",
      "specifics": ["specific observation about their GBP", "what's missing or weak", "what's present"]
    },
    "reviews": {
      "grade": "F",
      "specifics": ["review count and rating details", "recency observation", "response pattern if any"]
    },
    "citations": {
      "grade": "D",
      "specifics": ["directory presence observations", "NAP consistency issues", "which directories likely missing"]
    },
    "website": {
      "grade": "F",
      "specifics": ["schema markup status", "mobile/technical signals", "content structure observations"]
    },
    "discoverability": {
      "grade": "D",
      "specifics": ["entity footprint assessment", "LinkedIn/Reddit/press presence", "AI recommendation likelihood"]
    }
  },
  "whats_working": ["strength 1", "strength 2"],
  "gaps_to_fix": ["gap 1", "gap 2", "gap 3", "gap 4"],
  "suggested_opening": "A single conversational sentence you'd say at the start of the call that references something specific and real about their situation — like you've done your homework.",
  "weaknesses_to_lead": ["weakness framed as opportunity 1", "weakness 2", "weakness 3", "weakness 4", "weakness 5"],
  "strengths_to_acknowledge": ["genuine strength 1", "genuine strength 2", "genuine strength 3"],
  "key_talking_points": "2-3 sentence narrative paragraph summarizing the call strategy and what angle to take with this specific prospect.",
  "red_flags": ["red flag or urgency signal 1", "red flag 2", "red flag 3"],
  "contact": {
    "phone": "from GBP or Not found",
    "website": "from GBP or Not found",
    "address": "from GBP or Not found"
  }
}

Be specific and honest. Use the actual data. Don't invent information not supported by the data. If GBP is missing, that IS the finding.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Claude response');

    const brief = JSON.parse(jsonMatch[0]);

    // Run AI discoverability queries in parallel now that we have business_type
    const [chatgptResult, perplexityResult] = await Promise.all([
      queryAI('chatgpt', brief.business_type || business_name, city_state),
      queryAI('perplexity', brief.business_type || business_name, city_state),
    ]);

    // Also save a lightweight report to KV for the report page
    const id = randomUUID().replace(/-/g, '').slice(0, 12);
    const report: ReportData & { source: string } = {
      business_name: brief.business_name,
      overall_grade: brief.overall_grade,
      gbp_grade: brief.grades.gbp.grade,
      reviews_grade: brief.grades.reviews.grade,
      citations_grade: brief.grades.citations.grade,
      website_grade: brief.grades.website.grade,
      ai_grade: brief.grades.discoverability.grade,
      narrative: brief.key_talking_points,
      action_1: brief.gaps_to_fix[0] || '',
      action_2: brief.gaps_to_fix[1] || '',
      action_3: brief.gaps_to_fix[2] || '',
      created_at: new Date().toISOString(),
      source: 'internal',
      business_type: brief.business_type,
      city_state,
    };
    await kv.set(`report:${id}`, report, { ex: 60 * 60 * 24 * 30 });

    const aiVisibility = {
      chatgpt: {
        query: `Who are the best ${brief.business_type}s in ${city_state}?`,
        response: chatgptResult.response,
        mentioned: chatgptResult.response.toLowerCase().includes(business_name.toLowerCase()),
        error: chatgptResult.error,
      },
      perplexity: {
        query: `Who are the best ${brief.business_type}s in ${city_state}?`,
        response: perplexityResult.response,
        mentioned: perplexityResult.response.toLowerCase().includes(business_name.toLowerCase()),
        error: perplexityResult.error,
      },
    };

    return NextResponse.json({ brief, report_id: id, ai_visibility: aiVisibility, citations });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
