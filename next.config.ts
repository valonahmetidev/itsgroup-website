import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { securityHeaders } from "./src/lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "treco.mk", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "tremark.mk", pathname: "/wp-content/uploads/**" },
    ],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
