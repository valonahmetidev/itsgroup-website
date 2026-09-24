import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { securityHeaders } from "./src/lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/proizvod/treco/:id", destination: "/proizvod/:id", permanent: true },
      { source: "/proizvod/tremark/:id", destination: "/proizvod/:id", permanent: true },
      { source: "/proizvod/alevado/:id", destination: "/proizvod/:id", permanent: true },
      { source: "/proizvod/its/:id", destination: "/proizvod/:id", permanent: true },
      { source: "/kategorija/treco/:id", destination: "/kategorija/technology/:id", permanent: true },
      { source: "/kategorija/tremark/:id", destination: "/kategorija/home/:id", permanent: true },
      { source: "/kategorija/alevado/:id", destination: "/kategorija/cables/:id", permanent: true },
    ];
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
