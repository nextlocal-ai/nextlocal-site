const DIRECTORIES = [
  { label: 'Yelp', site: 'yelp.com' },
  { label: 'BBB', site: 'bbb.org' },
  { label: 'Apple Maps', site: 'maps.apple.com' },
  { label: 'Bing Places', site: 'bing.com/maps' },
  { label: 'Yellow Pages', site: 'yellowpages.com' },
];

export interface CitationResult {
  grade: string;
  found: string[];
  missing: string[];
  summary: string;
}

function gradeFromRatio(ratio: number): string {
  if (ratio >= 1.0) return 'A';
  if (ratio >= 0.8) return 'B';
  if (ratio >= 0.6) return 'C';
  if (ratio >= 0.4) return 'D';
  return 'F';
}

export async function checkCitations(businessName: string, cityState: string): Promise<CitationResult> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return { grade: 'N/A', found: [], missing: [], summary: 'SERPAPI_KEY not configured' };
  }

  const results = await Promise.all(
    DIRECTORIES.map(async ({ label, site }) => {
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
  const grade = gradeFromRatio(found.length / DIRECTORIES.length);

  return {
    grade,
    found,
    missing,
    summary: `Found on ${found.length}/${DIRECTORIES.length} directories. Present: ${found.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}.`,
  };
}
