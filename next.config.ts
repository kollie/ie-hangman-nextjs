import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true, // ✅ Allows Next.js to build even with TypeScript errors
  },
};

export default nextConfig;
