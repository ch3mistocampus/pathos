import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so Next doesn't accidentally pick up a stray
    // package-lock.json from a parent directory.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
