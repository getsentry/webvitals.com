import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure external packages that should not be bundled by Next.js
  serverExternalPackages: [
    "import-in-the-middle",
    "require-in-the-middle", 
    "shiki"
  ],
  // Configure external packages that need server-side handling
  transpilePackages: ["streamdown"],
};

export default nextConfig;
