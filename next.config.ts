import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All pages are SSR by default in Next.js App Router.
  // No static export — Vercel handles SSR natively.
  async headers() {
    return [
      {
        source: "/llms.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
