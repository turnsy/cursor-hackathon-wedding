import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so a parent-directory lockfile
  // doesn't confuse Next.js / Turbopack during local and Vercel builds.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
