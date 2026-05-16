import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Workspace root is the repo root so the Next app can import from the
    // sibling `convex/` package (schema, functions, and generated types
    // for the user-submission flow).
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
