import type { NextConfig } from "next";
import path from "node:path";

// For GitHub Pages project sites the app is served at /<repo-name>/.
// CI sets NEXT_PUBLIC_BASE_PATH so the same build works locally (empty) and on Pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  // Lift the Turbopack root so we can import scraper output from ../data/.
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
