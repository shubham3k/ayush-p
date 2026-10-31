import type { NextConfig } from "next";

// Videos and posters rarely change, so let browsers and Vercel's CDN keep them for a week
// instead of re-checking on every visit. If you replace a file, give the new one a new name
// (or wait up to a week) so visitors don't see the old version.
const mediaCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/reels/:path*", headers: mediaCache },
      { source: "/work/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
