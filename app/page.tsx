import LeadForm from "@/components/LeadForm";
import { TopTicker, BusinessTicker } from "@/components/Ticker";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      {/* ── Top Ticker ──────────────────────────────────────── */}
      <div className="overflow-x-hidden"><TopTicker /></div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="border-b-2 border-ink bg-cream px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="hidden md:block font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-widest text-ink hover:text-orange transition-colors"
            >
              How It Works
            </a>
            <a
              href="#get-report"
              className="border-2 border-ink bg-ink text-cream px-5 py-2.5 font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-widest hover:bg-orange hover:border-orange transition-colors duration-150"
            >
              Get Free Report →
            </a>
          </div>
        </div>
      </nav>

      <div className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-ink min-h-[calc(100vh-var(--nav-h,88px))]">
        {/* Left — cream */}
        <div className="px-10 py-16 md:py-24 border-b-2 md:border-b-0 md:border-r-2 border-ink flex flex-col justify-center">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-widest text-orange mb-5 flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 bg-orange" />
            AI Visibility for Local Business
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] font-black text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[1.0] text-ink mb-8">
            Your competitors are getting the{" "}
            <em className="text-orange italic">AI referral.</em> You&apos;re
            not.
          </h1>
          <p className="text-base text-ink/70 font-light leading-relaxed mb-8 max-w-md">
            When someone asks ChatGPT for &ldquo;the best plumber near me&rdquo;
            or &ldquo;a reliable contractor in Austin&rdquo; — AI picks one
            business and recommends it. We make sure that business is yours.
          </p>
          <a
            href="#get-report"
            className="self-start inline-block border-2 border-orange bg-orange text-cream px-8 py-4 font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-widest hover:bg-ink hover:border-ink transition-colors duration-150"
          >
            Get My Free AI Visibility Report →
          </a>
          <p className="mt-4 font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted">
            Shows exactly where you rank in AI answers — and what to fix.
          </p>
        </div>

        {/* Right — dark */}
        <div className="px-10 py-16 md:py-24 flex flex-col justify-center gap-10 min-h-full" style={{ backgroundColor: "rgb(10, 10, 8)" }}>
          <HeroStat
            number="62%"
            label="of users trust AI recommendations over Google results"
          />
          <div className="border-t border-cream/10" />
          <HeroStat
            number="3×"
            label="more calls to businesses that appear in AI answers"
          />
          <div className="border-t border-cream/10" />
          <HeroStat
            number="1"
            label="business gets recommended per query. One winner per search."
          />
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted/60 leading-relaxed">
            Sources: BrightLocal Local Consumer Survey 2025 / Max AI Visibility
            Study 2025
          </p>
        </div>
      </section>

      {/* ── Business Ticker ─────────────────────────────────── */}
      <BusinessTicker />

      {/* ── The Problem ─────────────────────────────────────── */}
      <section className="border-b-2 border-ink">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Left label */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink px-6 lg:px-10 py-16 bg-cream2 relative">
            <h2 className="text-4xl lg:text-5xl leading-[1.0]" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: "rgb(26, 26, 22)" }}>
              The shift already happened.
            </h2>
            <div className="hidden lg:block absolute bottom-10 right-6">
              <span
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: "rgb(107, 107, 94)",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                The Problem
              </span>
            </div>
          </div>

          {/* Right content */}
          <div className="px-6 lg:px-12 py-16" style={{ backgroundColor: "rgb(245, 242, 235)" }}>
            <blockquote className="pl-6 mb-12" style={{ borderLeft: "4px solid rgb(200, 70, 10)" }}>
              <p className="text-2xl lg:text-3xl leading-relaxed" style={{ fontFamily: '"Playfair Display", serif', fontStyle: "italic", color: "rgb(26, 26, 22)" }}>
                &ldquo;Google it&rdquo; is giving way to &ldquo;ask ChatGPT.&rdquo; Your customers switched. Your marketing hasn&apos;t.
              </p>
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {[
                { n: "01", title: "AI doesn't scroll results", body: "ChatGPT, Gemini, and Perplexity synthesize one answer. There's no page two. No ad slot. Either you're in the answer or you're not." },
                { n: "02", title: "Old SEO doesn't transfer", body: "AI pulls from a different signal set than Google rankings. Being #1 on Google doesn't mean you exist in AI answers at all." },
                { n: "03", title: "Your competitors are moving", body: "AI visibility is still early — whoever builds authority now will be the default recommendation in their market for years." },
                { n: "04", title: "Most agencies don't know this yet", body: "The firms selling you SEO packages are optimizing for a 2019 search landscape. We only do AI visibility. It's all we think about." },
              ].map(({ n, title, body }) => (
                <div key={n} className="p-6" style={{ border: "1px solid rgba(26, 26, 22, 0.3)" }}>
                  <span className="text-[11px] mb-2 block" style={{ fontFamily: '"IBM Plex Mono", monospace', color: "rgb(200, 70, 10)" }}>{n}</span>
                  <h3 className="text-xl mb-3" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: "rgb(26, 26, 22)" }}>{title}</h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: '"DM Sans", sans-serif', color: "rgb(107, 107, 94)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28" style={{ backgroundColor: "rgb(10, 10, 8)", borderTop: "2px solid rgb(26, 26, 22)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <h2 className="text-4xl lg:text-5xl leading-tight" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: "rgb(237, 233, 222)" }}>
              How we get you into the{" "}
              <span style={{ fontStyle: "italic", color: "rgb(200, 70, 10)" }}>answer.</span>
            </h2>
            <p className="text-lg leading-relaxed self-end" style={{ fontFamily: '"DM Sans", sans-serif', color: "rgb(107, 107, 94)" }}>
              Most businesses are invisible to AI assistants. We fix that through a systematic approach to AI visibility that goes far beyond traditional SEO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { step: "Step 01", n: "01", title: "AI Visibility Audit", body: "We ask AI assistants 200+ variations of queries your potential customers use. We map where you appear, where competitors appear, and what signals are blocking your recommendations." },
              { step: "Step 02", n: "02", title: "Authority Signal Build", body: "AI recommends businesses it trusts. We build and verify the data layer — citations, structured info, reputation signals — that tells AI systems you're the authoritative choice in your category." },
              { step: "Step 03", n: "03", title: "Ongoing Monitoring", body: "AI models update. New platforms emerge. Your competitors adapt. We track your ranking across all major AI surfaces monthly and adjust to keep you recommended." },
            ].map(({ step, n, title, body }) => (
              <div key={n} className="relative p-8" style={{ border: "1px solid rgba(237, 233, 222, 0.2)" }}>
                <span className="absolute top-4 right-4 text-[120px] leading-none select-none pointer-events-none" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: "rgba(237, 233, 222, 0.05)" }}>{n}</span>
                <div className="relative z-10">
                  <span className="text-[11px] mb-4 block uppercase tracking-wider" style={{ fontFamily: '"IBM Plex Mono", monospace', color: "rgb(200, 70, 10)" }}>{step}</span>
                  <h3 className="text-2xl mb-4" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: "rgb(237, 233, 222)" }}>{title}</h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: '"DM Sans", sans-serif', color: "rgb(107, 107, 94)" }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead Form ───────────────────────────────────────── */}
      <section
        id="get-report"
        className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-ink"
      >
        {/* Left — orange */}
        <div className="px-6 lg:px-12 py-16 lg:py-24 flex flex-col justify-center" style={{ backgroundColor: "rgb(200, 70, 10)" }}>
          <h2 className="text-4xl lg:text-5xl leading-tight mb-6" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, color: "white" }}>
            Find out where AI ranks you. For free.
          </h2>
          <p className="text-lg leading-relaxed mb-12 max-w-md" style={{ fontFamily: '"DM Sans", sans-serif', color: "rgba(255, 255, 255, 0.9)" }}>
            We&apos;ll run your business through our AI audit and show you exactly where you appear — and don&apos;t — across ChatGPT, Gemini, and Perplexity.
          </p>
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-wider" style={{ fontFamily: '"IBM Plex Mono", monospace', color: "rgba(255, 255, 255, 0.7)" }}>512-940-6498</p>
            <p className="text-[11px] uppercase tracking-wider" style={{ fontFamily: '"IBM Plex Mono", monospace', color: "rgba(255, 255, 255, 0.7)" }}>hello@nextlocal.ai</p>
          </div>
        </div>

        {/* Right — form */}
        <div className="px-6 lg:px-12 py-16 lg:py-24" style={{ backgroundColor: "rgb(237, 233, 222)" }}>
          <h3 className="text-3xl mb-2" style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: "rgb(26, 26, 22)" }}>
            Get Your Free AI Visibility Report
          </h3>
          <p className="text-[11px] uppercase tracking-wider mb-10" style={{ fontFamily: '"IBM Plex Mono", monospace', color: "rgb(107, 107, 94)" }}>
            Takes 2 minutes. No credit card. No sales call unless you want one.
          </p>
          <LeadForm />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-ink px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <LogoLight />
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-widest text-muted">
            © {new Date().getFullYear()} Next Local AI. Austin, TX. All Rights
            Reserved.
          </p>
        </div>
      </footer>
      </div>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Logo() {
  return (
    <span className="font-[family-name:var(--font-playfair)] font-black text-xl tracking-tight text-ink">
      Next<span className="text-orange">Local</span> AI
    </span>
  );
}

function LogoLight() {
  return (
    <span className="font-[family-name:var(--font-playfair)] font-black text-xl tracking-tight text-cream">
      Next<span className="text-orange">Local</span> AI
    </span>
  );
}

function HeroStat({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  // Split number into numeric part + suffix (%, ×)
  const match = number.match(/^(\d+)(.*)$/);
  const num = match ? match[1] : number;
  const suffix = match ? match[2] : "";

  return (
    <div>
      <p className="font-[family-name:var(--font-playfair)] font-black text-[4rem] leading-none text-cream">
        {num}
        {suffix && <span className="text-orange">{suffix}</span>}
      </p>
      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-widest text-muted mt-2 max-w-xs">
        {label}
      </p>
    </div>
  );
}


