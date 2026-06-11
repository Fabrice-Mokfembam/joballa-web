import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    /** Bridge Vite-style `.env` key so SSR and client both see the Google client ID. */
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.VITE_GOOGLE_CLIENT_ID ?? "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.businessincameroon.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
