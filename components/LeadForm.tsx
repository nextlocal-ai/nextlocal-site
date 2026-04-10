"use client";

import { useState, useRef, FormEvent } from "react";
import { gtagEvent } from "@/lib/gtag";

const BUSINESS_TYPES = [
  "Plumber", "Electrician", "HVAC contractor", "Roofer", "Landscaper",
  "House cleaner", "Pest control", "Pool service", "Painter", "General contractor",
  "Divorce attorney", "Personal injury attorney", "Estate planning attorney",
  "CPA / accountant", "Financial advisor", "Insurance agent", "Mortgage broker",
  "Doctor", "Dentist", "Orthodontist", "Chiropractor", "Physical therapist",
  "Optometrist", "Dermatologist", "Pediatrician",
  "Real estate agent", "Property manager", "Home inspector",
  "Auto mechanic", "Auto body shop",
  "Veterinarian", "Wedding photographer", "Personal trainer", "Interior designer",
];

function BusinessTypeInput() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = value.trim().length > 0
    ? BUSINESS_TYPES.filter(t => t.toLowerCase().includes(value.toLowerCase()))
    : [];

  function select(option: string) {
    setValue(option);
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        name="businessType"
        required
        autoComplete="off"
        placeholder="e.g. plumber, divorce attorney, dentist"
        className="w-full input-underline"
        value={value}
        onChange={e => { setValue(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => { if (matches.length > 0) setOpen(true); }}
      />
      {open && matches.length > 0 && (
        <ul style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#f5f2eb", border: "1px solid #1a1a16",
          listStyle: "none", margin: 0, padding: 0,
          maxHeight: "200px", overflowY: "auto", zIndex: 50,
        }}>
          {matches.map(option => (
            <li
              key={option}
              onMouseDown={() => select(option)}
              style={{
                padding: "10px 14px", cursor: "pointer",
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: "12px", color: "#1a1a16",
                borderBottom: "1px solid rgba(26,26,22,0.08)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#ede9de")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
      const submissionId = crypto.randomUUID();
      const businessName = (payload["businessName"] as string) || "";

      gtagEvent('form_submit', { business_type: payload['businessType'], city: payload['city'], state: payload['state'] });

      // Proxy through our own API to avoid CORS issues with Make
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, session_id: submissionId }),
      });

      // Redirect immediately — polling handles the rest
      const params = new URLSearchParams({ business_name: businessName, submission_id: submissionId });
      window.location.href = `/generating?${params}`;
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

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Business Type</label>
        <BusinessTypeInput />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Email Address</label>
        <input required placeholder="john@example.com" className="w-full input-underline" type="email" name="email" />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>Phone Number</label>
        <input placeholder="(555) 123-4567" className="w-full input-underline" type="tel" name="phone" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>City</label>
          <input required placeholder="Austin" className="w-full input-underline" type="text" name="city" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider mb-2" style={labelStyle}>State</label>
          <select required name="state" className="w-full input-underline" defaultValue="" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', background: 'transparent', cursor: 'pointer' }}>
            <option value="" disabled>Select state</option>
            {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
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
