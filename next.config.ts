import type { NextConfig } from "next";

const upstreamApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const isAbsoluteUpstream = /^https?:\/\//.test(upstreamApiUrl);

const nextConfig: NextConfig = {
  /**
   * Proxy /api/* on the frontend origin to the upstream API. The browser
   * only ever talks to the frontend, so the better-auth session cookie
   * lands on the frontend's origin and is visible to middleware — the
   * cross-origin setup hides it otherwise. NEXT_PUBLIC_API_URL is expected
   * to be the full upstream base, e.g. https://casepilot-navy.vercel.app/api.
   */
  async rewrites() {
    if (!isAbsoluteUpstream) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${upstreamApiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
