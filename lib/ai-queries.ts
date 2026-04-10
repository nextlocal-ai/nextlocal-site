export type AIPlatform = 'chatgpt' | 'perplexity';

export interface AIQueryOutcome {
  response: string;
  error?: string;
}

export function buildLocalQuery(businessType: string, cityState: string): string {
  return `Who are the best ${businessType}s in ${cityState}? Give me your top recommendations.`;
}

export async function queryAI(
  platform: AIPlatform,
  businessType: string,
  cityState: string
): Promise<AIQueryOutcome> {
  const query = buildLocalQuery(businessType, cityState);

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
    }

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
    if (!res.ok) {
      return { response: '', error: data.error?.message || `HTTP ${res.status}` };
    }
    return { response: data.choices?.[0]?.message?.content || '' };
  } catch (err) {
    return { response: '', error: err instanceof Error ? err.message : 'Request failed' };
  }
}
