const DEFAULT_CUTOFFS = [
  'When selecting',
  'Before making',
  'It is advisable',
  'Consider obtaining',
  'To find the best',
  'Other mentions',
];

interface RenderOptions {
  /** Color for headings and body text (default: dark — light background) */
  headingColor?: string;
  /** Color for links (default: orange) */
  linkColor?: string;
  /** Extra phrases to strip trailing content from */
  extraCutoffs?: string[];
}

export function renderMarkdown(text: string, options: RenderOptions = {}): string {
  const {
    headingColor = 'var(--color-ink)',
    linkColor = 'var(--color-orange)',
    extraCutoffs = [],
  } = options;

  const cutoffs = [...DEFAULT_CUTOFFS, ...extraCutoffs];
  let trimmed = text;
  for (const cutoff of cutoffs) {
    const idx = trimmed.lastIndexOf('\n' + cutoff);
    if (idx > trimmed.length / 2) {
      trimmed = trimmed.slice(0, idx);
      break;
    }
  }

  return trimmed
    .replace(/^### (.+)$/gm, `<strong style="display:block;margin-top:12px;margin-bottom:4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-muted)">$1</strong>`)
    .replace(/^## (.+)$/gm, `<strong style="display:block;margin-top:12px;margin-bottom:4px;font-size:13px;color:${headingColor}">$1</strong>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em style="color:var(--color-muted)">$1</em>')
    .replace(/\[(\d+)\]/g, '<sup style="color:var(--color-muted);font-size:9px">[$1]</sup>')
    .replace(/^- /gm, '• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/\[([^\]]+)\]\(([^)"]+)[^)]*\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${linkColor};text-decoration:underline">$1</a>`);
}
