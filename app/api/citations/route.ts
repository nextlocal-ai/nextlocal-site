import { NextRequest, NextResponse } from 'next/server';

const DIRECTORIES = [
  { key: 'yelp', label: 'Yelp', site: 'yelp.com' },
  { key: 'bbb', label: 'BBB', site: 'bbb.org' },
  { key: 'apple_maps', label: 'Apple Maps', site: 'maps.apple.com' },
  { key: 'bing', label: 'Bing Places', site: 'bing.com/maps' },
  { key: 'yellowpages', label: 'Yellow Pages', site: 'yellowpages.com' },
];

function gradeFromScore(found: number, total: number): string {
  const ratio = found / total;
  if (ratio >= 1.0) return 'A';
  if (ratio >= 0.8) return 'B';
  if (ratio >= 0.6) return 'C';
  if (ratio >= 0.4) return 'D';
  return 'F';
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const businessName = searchParams.get('businessName');
  const cityState = searchParams.get('cityState');

  if (!businessName || !cityState) {
    return NextResponse.json({ error: 'businessName and cityState required' }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'SERPAPI_KEY not configured' }, { status: 500 });
  }

  const results = await Promise.all(
    DIRECTORIES.map(async ({ key, label, site }) => {
      const query = `"${businessName}" "${cityState}" site:${site}`;
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=3&api_key=${apiKey}`;
      try {
        const res = await fetch(url, { next: { revalidate: 0 } });
        const data = await res.json();
        const found = Array.isArray(data.organic_results) && data.organic_results.length > 0;
        return { key, label, found };
      } catch {
        return { key, label, found: false };
      }
    })
  );

  const found = results.filter(r => r.found);
  const missing = results.filter(r => !r.found);
  const grade = gradeFromScore(found.length, DIRECTORIES.length);

  return NextResponse.json({
    grade,
    score: found.length,
    total: DIRECTORIES.length,
    found: found.map(r => r.label),
    missing: missing.map(r => r.label),
    summary: `Found on ${found.length}/${DIRECTORIES.length} directories: ${found.map(r => r.label).join(', ') || 'none'}. Missing: ${missing.map(r => r.label).join(', ') || 'none'}.`,
  });
}
