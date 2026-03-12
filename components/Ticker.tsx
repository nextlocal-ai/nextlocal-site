"use client";

export function TopTicker() {
  const items = [
    "AI SEARCH IS REPLACING GOOGLE",
    "CHATGPT NOW HANDLES 1B+ QUERIES/MONTH",
    "LOCAL BUSINESSES LOSING CALLS TO AI-INVISIBLE COMPETITORS",
    "PERPLEXITY USAGE UP 300% YOY",
    "IS YOUR BUSINESS SHOWING UP IN AI ANSWERS?",
    "AI SEARCH IS REPLACING GOOGLE",
    "CHATGPT NOW HANDLES 1B+ QUERIES/MONTH",
    "LOCAL BUSINESSES LOSING CALLS TO AI-INVISIBLE COMPETITORS",
    "PERPLEXITY USAGE UP 300% YOY",
    "IS YOUR BUSINESS SHOWING UP IN AI ANSWERS?",
  ];

  return (
    <div className="overflow-hidden bg-ink border-b-2 border-ink py-2.5">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: "ticker 30s linear infinite" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted uppercase tracking-widest shrink-0"
          >
            {item} <span className="text-orange mx-2">◆</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function BusinessTicker() {
  const items = [
    "Plumbers",
    "Contractors",
    "Attorneys",
    "HVAC",
    "Electricians",
    "Landscapers",
    "Roofers",
    "Accountants",
    "Dentists",
    "Realtors",
    "Plumbers",
    "Contractors",
    "Attorneys",
    "HVAC",
    "Electricians",
    "Landscapers",
    "Roofers",
    "Accountants",
    "Dentists",
    "Realtors",
  ];

  return (
    <div className="overflow-hidden bg-orange py-3">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: "ticker2 25s linear infinite" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="font-[family-name:var(--font-playfair)] font-black text-cream text-xl shrink-0 px-6"
          >
            {item} <span className="text-cream/50">/</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
