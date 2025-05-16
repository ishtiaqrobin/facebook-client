import type { NextConfig } from "next";

// https://nextjs.org/docs/messages/export-image-api
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
