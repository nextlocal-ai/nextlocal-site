"use client";

import { useState, FormEvent } from "react";

const WEBHOOK_URL =
  "https://hook.us2.make.com/e5u4uj5un5wkoy4qi5tvpwztfsree5ry";

const labelStyle = {
  fontFamily: '"IBM Plex Mono", monospace',
  color: "rgb(107, 107, 94)",
};

const btnStyle = {
  fontFamily: '"IBM Plex Mono", monospace',
  backgroundColor: "rgb(10, 10, 8)",
  color: "rgb(237, 233, 222)",
};

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      const businessName = (payload["businessName"] as string) || "";

      // Extract submission_id from Make's response body (handles newlines/whitespace in URL)
      const match = responseText.match(/submission_id=([^&\s]+)/);
      const submissionId = match ? match[1] : "";

      const params = new URLSearchParams({ business_name: businessName });
      if (submissionId) params.set("submission_id", submissionId);
      window.location.href = `https://nextlocal.ai/generating?${params}`;
    } catch {
      setError("Something went wrong. Please try again or email hello@nextlocal.ai.");
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>First Name</label>
          <input required placeholder="John" className="w-full input-underline" type="text" name="firstName" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Last Name</label>
          <input required placeholder="Doe" className="w-full input-underline" type="text" name="lastName" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Business Name</label>
        <input required placeholder="Your Business LLC" className="w-full input-underline" type="text" name="businessName" />
      </div>

      <div className="relative">
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Business Type</label>
        <select name="businessType" required className="w-full select-underline pr-6">
          <option value="" disabled>Select your business type</option>
          <option value="Contractor/Trades">Contractor/Trades</option>
          <option value="Legal Services">Legal Services</option>
          <option value="Medical/Dental">Medical/Dental</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Financial Services">Financial Services</option>
          <option value="Home Services">Home Services</option>
          <option value="Other Local Business">Other Local Business</option>
        </select>
        <span className="absolute right-0 bottom-2 pointer-events-none text-xs" style={{ color: "rgb(107, 107, 94)" }}>▾</span>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Email Address</label>
        <input required placeholder="john@example.com" className="w-full input-underline" type="email" name="email" />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Phone Number</label>
        <input placeholder="(555) 123-4567" className="w-full input-underline" type="tel" name="phone" />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Business Website</label>
        <input placeholder="yourbusiness.com" className="w-full input-underline" type="text" name="businessWebsite" />
      </div>

      {error && (
        <p className="text-xs" style={{ color: "rgb(200, 70, 10)", border: "1px solid rgb(200, 70, 10)", padding: "0.5rem 0.75rem" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-[11px] uppercase tracking-wider py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 transition-colors duration-200"
        style={btnStyle}
      >
        {loading ? "Sending…" : "Get My AI Visibility Report"}
        {!loading && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
      </button>
    </form>
  );
}
