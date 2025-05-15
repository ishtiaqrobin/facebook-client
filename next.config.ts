import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: [
      "daisyui.com",
      "graph.facebook.com",
      "platform-lookaside.fbsbx.com",
      "scontent.fjsr1-1.fna.fbcdn.net",
      "scontent.fdac24-2.fna.fbcdn.net",
    ],
  },
};

export default nextConfig;
